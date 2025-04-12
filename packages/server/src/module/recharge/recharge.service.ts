import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { GLOBAL_VALUE_ENTITY_ID, LOCAL_MQ_ID, ORDER_TYPE, RECHARGE_HKEY, RechargeOrder, TRANSACTION_LINK_TYPE } from "../../common";
import {
    CommonHelper,
    $asyncAllNoNullMap,
    memTimeCache,
    MEM_TIME_CACHE_STRATEGY,
    Logger,
    BCF_DEFAULT_DECIMALS,
    InternalAssetType,
    ChainHelper,
    ResponseError,
    ExternalAssetType,
    ExternalMainAssetType,
} from "@bnqkl/wallet-sdk";
import { GlobalValueRedisRepository } from "../redis";
import { RechargeRecordsReqDto, RechargeV2ReqDto } from "./dto";
import { RechargeOrderRepository } from "./recharge.repository";
import { MemoryService } from "../memory/memory.service";
import { OrderHelper, RechargeHelper, VerifyHelper, walletServerSdk } from "../../helper";
import {
    RECHARGE_ORDER_STATE_ID,
    ErrorCode,
    INTERNAL_CHAIN_RW_ACCOUNT_TYPE,
    ExternalChainName,
    ExternalTransStateID,
    InternalChainName,
    RECHARGE_TYPE,
} from "@cot/core";
import { ExternalChainHelper } from "@bnqkl/wallet-sdk";
import { FindOptionsWhere, In } from "typeorm";

@Injectable()
export class RechargeService {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;
    @Inject(forwardRef(() => RechargeOrderRepository))
    private __rechargeOrderRepository!: RechargeOrderRepository;
    @Inject(forwardRef(() => MemoryService))
    private __memoryService!: MemoryService;

    private __orderType = ORDER_TYPE.RECHARGE;

    /**
     * 验证地址余额
     * @param detail
     */
    private async __verifyBalance(detail: COTServer.Recharge.TransDetail) {
        const { chainName, from, amount, contractAddress } = detail.fromDetail;
        // 验证外链
        if (await RechargeHelper.isRechargeDevTest()) {
            return;
        }
        let balanceAmount: string;
        if (contractAddress) {
            balanceAmount = (await walletServerSdk.getExternalAccountBalance({ chainName, address: from, contractAddress })).amount;
        } else {
            balanceAmount = await walletServerSdk.getExternalBalance({ chainName, address: from });
        }
        const externalBalance = BigInt(balanceAmount);
        if (externalBalance < BigInt(amount)) {
            throw Error(`chainName:${chainName} address:${from} externalBalance:${externalBalance} is less than amount:${amount}`);
        }
    }

    /**
     * 创建外链交易
     * @param orderId
     * @param fromTrJson
     * @param detail
     * @returns
     */
    private async __createExternalTrans(
        orderId: string,
        fromTrJson: WalletTypings.ExternalChain.FromTrJson,
        detail: COTServer.Recharge.TransDetail,
    ): Promise<string> {
        if (await RechargeHelper.isRechargeDevTest()) {
            return CommonHelper.getUuid();
        }
        const { chainName, from, to, amount, contractAddress, txHash } = detail.fromDetail;
        const getTrJson: () => WalletTypings.ExternalChain.EthTrJson | BFChainWallet.TRON.TronTransaction | BFChainWallet.TRON.Trc20Transaction = () => {
            switch (chainName) {
                case ExternalChainName.ETH:
                    const ethTrans = fromTrJson.eth;
                    if (!ethTrans) {
                        Logger.error(`__createExternalTrans ethTrans undefined`);
                        throw new ResponseError(ErrorCode.RECHARGE_TRAN_SIGN_MISSING);
                    }
                    return { signTransData: ethTrans.signTransData, txHash };
                case ExternalChainName.BSC:
                    const bscTrans = fromTrJson.bsc;
                    if (!bscTrans) {
                        Logger.error(`__createExternalTrans bscTrans undefined`);
                        throw new ResponseError(ErrorCode.RECHARGE_TRAN_SIGN_MISSING);
                    }
                    return { signTransData: bscTrans.signTransData, txHash };
                case ExternalChainName.TRON:
                    const tronTrans = fromTrJson.tron ?? fromTrJson.trc20;
                    if (!tronTrans) {
                        Logger.error(`__createExternalTrans tronTrans undefined`);
                        throw new ResponseError(ErrorCode.RECHARGE_TRAN_SIGN_MISSING);
                    }
                    return tronTrans;
                default:
                    Logger.error(`recharge not support extra chain ${chainName}`);
                    throw new ResponseError(ErrorCode.RECHARGE_NOT_SUPPORT_CHAIN);
            }
        };
        const { txId } = await walletServerSdk.saveExternalTransfer({
            chainName,
            transactionJSON: getTrJson(),
            detail: {
                from,
                to,
                amount,
                assetSymbol: detail.fromAssetSymbol,
                fee: "0",
                contract: contractAddress,
            },
            param: {
                mqId: LOCAL_MQ_ID,
                linkType: TRANSACTION_LINK_TYPE.RECHARGE_ORDER,
                linkId: orderId,
            },
        });
        return txId;
    }

    /**
     * 充值订单重试外链上链
     * @param orderId
     * @param authorization
     */
    async retryExternalOnChain(orderId: string, authorization?: COTServer.CurrentAuthInfo) {
        const { walletTxId, walletAddress, walletChain } = await this.__rechargeOrderRepository.findOneByForce({
            entityId: orderId,
            state: RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL,
        });
        const updateTransSuccess = await walletServerSdk.updateExternalTransState({
            chainName: walletChain,
            txId: walletTxId,
            state: ExternalTransStateID.INIT,
        });
        if (!updateTransSuccess) {
            throw Error(`<${this.__orderType}> update [${walletChain}] txId:${walletTxId} to state:${ExternalTransStateID.INIT} fail`);
        }
        const { affected } = await this.__rechargeOrderRepository.update(
            { entityId: orderId, state: RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL },
            { state: RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN },
        );
        if (!affected) {
            throw Error(
                `<${this.__orderType}> update orderId:${orderId} state:${RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL} to state:${RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN} fail`,
            );
        }
        await OrderHelper.createRechargeOrderObj(orderId);
        return true;
    }

    /**
     * 充值订单重试内链上链
     * @param orderId
     * @param authorization
     */
    async retryInternalOnChain(orderId: string) {
        const { affected } = await this.__rechargeOrderRepository.update(
            { entityId: orderId, state: RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL },
            { state: RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN },
        );
        if (!affected) {
            throw Error(
                `<${this.__orderType}> update orderId:${orderId} state:${RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL} to state:${RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN} fail`,
            );
        }
        await OrderHelper.createRechargeOrderObj(orderId);
        return true;
    }

    /**
     * 获取充值记录
     * @param authorization
     * @param dto
     * @returns
     */
    async getRecords(dto: RechargeRecordsReqDto): Promise<COTCore.Recharge.Api.RechargeRecordsResDto> {
        const { internalChain, internalAddress, recordState, page, pageSize } = dto;
        const options: FindOptionsWhere<RechargeOrder> = { internalChain, internalAddress, rechargeType: RECHARGE_TYPE.ISSUE };
        // 筛选state
        if (recordState) {
            options.state = In(RechargeHelper.getOrderStateArray(recordState));
        }
        const result = await this.__rechargeOrderRepository.findByPage({ where: options, order: { id: "DESC" } }, page, pageSize);
        const realDataList = await $asyncAllNoNullMap(
            result.dataList,
            async ({
                entityId,
                state,
                walletAmount,
                walletAsset,
                walletDecimals,
                createdTime,
                internalChain,
                rechargeTxId,
                rechargeAmount,
                rechargeAssetType,
                walletChain,
            }) => {
                const fromTxInfo: WalletTypings.Order.RecordTxInfo = {
                    chainName: walletChain,
                    amount: walletAmount,
                    asset: walletAsset,
                    decimals: walletDecimals,
                };
                const toTxInfoArray: WalletTypings.Order.RecordTxInfo[] = [];
                if (rechargeTxId !== entityId) {
                    toTxInfoArray.push({
                        chainName: internalChain,
                        amount: rechargeAmount.toString(),
                        asset: rechargeAssetType,
                        decimals: BCF_DEFAULT_DECIMALS,
                    });
                }
                const record: COTCore.Recharge.RechargeRecord = {
                    orderId: entityId,
                    state: RechargeHelper.getRecordState(state),
                    orderState: state,
                    fromTxInfo,
                    toTxInfoArray,
                    createdTime,
                };
                return record;
            },
        );
        const pageData = result.replaceDataList(realDataList);
        return pageData;
    }

    /**
     * 获取充值记录详情
     * @param authorization
     * @param orderId
     * @returns
     */
    async getRecordDetail(orderId: string): Promise<COTCore.Recharge.Api.RechargeRecordDetailResDto> {
        const { state, walletChain, walletTxId, walletAddress, contractAddress, internalChain, internalAddress, rechargeTxId, updatedTime, rechargeAssetType } =
            await this.__rechargeOrderRepository.findOneByForce({
                entityId: orderId,
            });
        const { txHash, failReason, feeInfo } = await OrderHelper.getTxInfo(walletChain, walletTxId);
        const fromTxInfo: WalletTypings.Order.RecordDetailTxInfo = {
            chainName: walletChain,
            address: walletAddress,
            txId: walletTxId,
            txHash,
            contractAddress,
            feeInfo,
        };
        // 订单失败原因
        let orderFailReason = failReason;
        const toTxInfos: { [assetType: string]: WalletTypings.Order.RecordDetailTxInfo } = {};
        if (rechargeTxId !== orderId) {
            const { txHash, failReason, feeInfo } = await OrderHelper.getTxInfo(internalChain, rechargeTxId);
            toTxInfos[rechargeAssetType] = {
                chainName: internalChain,
                address: internalAddress,
                txId: rechargeTxId,
                txHash,
                feeInfo,
            };
            if (failReason) {
                orderFailReason = failReason;
            }
        }
        const detail: COTCore.Recharge.Api.RechargeRecordDetailResDto = {
            state: RechargeHelper.getRecordState(state),
            orderState: state,
            fromTxInfo,
            toTxInfos,
            orderFailReason,
            updatedTime,
        };
        return detail;
    }

    async getRechageSupport() {
        const recharge = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        return { recharge };
    }

    /**
     * 获取合约池信息
     */
    @memTimeCache({ time: MEM_TIME_CACHE_STRATEGY.TEN_MINUTE })
    async getContractPoolInfo(): Promise<COTCore.Recharge.Api.RechargeContractPoolResDto> {
        const poolInfo: COTCore.Recharge.Api.RechargeContractPoolItem[] = [];
        const recharge = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        const getETHContractBalance = async (address: string, contractAddress?: string) => {
            try {
                let decimal: number;
                let balance: string;
                if (contractAddress) {
                    const balanceItem = await walletServerSdk.getEthContractBalance({ address, contractAddress });
                    decimal = balanceItem.decimal;
                    balance = balanceItem.balance;
                } else {
                    decimal = 18;
                    balance = await walletServerSdk.getExternalBalance({ chainName: ExternalChainName.ETH, address });
                }
                const result = ExternalChainHelper.transformDecimalToBCF(decimal, balance);
                return result;
            } catch (error) {
                Logger.warn(error);
                return BigInt(0);
            }
        };
        const getBSCContractBalance = async (address: string, contractAddress?: string) => {
            try {
                let decimal: number;
                let balance: string;
                if (contractAddress) {
                    const balanceItem = await walletServerSdk.getBscContractBalance({ address, contractAddress });
                    decimal = balanceItem.decimal;
                    balance = balanceItem.balance;
                } else {
                    decimal = 18;
                    balance = await walletServerSdk.getExternalBalance({ chainName: ExternalChainName.BSC, address });
                }
                const result = ExternalChainHelper.transformDecimalToBCF(decimal, balance);
                return result;
            } catch (error) {
                Logger.warn(error);
                return BigInt(0);
            }
        };
        const getTRONContractBalance = async (address: string, contract?: string) => {
            try {
                let decimal: number;
                let balance: string;
                if (contract) {
                    const balanceItem = await walletServerSdk.getTronContractBalance({ address, contract });
                    decimal = balanceItem.decimal;
                    balance = balanceItem.balance;
                } else {
                    decimal = 6;
                    balance = await walletServerSdk.getExternalBalance({ chainName: ExternalChainName.TRON, address });
                }

                const result = ExternalChainHelper.transformDecimalToBCF(decimal, balance);
                return result;
            } catch (error) {
                Logger.warn(error);
                return BigInt(0);
            }
        };
        const pAll: any = [];
        for (const _c in recharge) {
            for (const _a in recharge[_c]) {
                try {
                    const item = recharge[_c][_a];
                    const { chainName, assetType } = item;
                    const _func = async (chainName: InternalChainName, assetType: InternalAssetType) => {
                        const externalChainInfo: COTCore.Recharge.Api.ExternalChainInfo[] = [];
                        let totalStaked = BigInt(0);
                        if (item.supportChain.ETH) {
                            externalChainInfo.push({
                                chainName: ExternalChainName.ETH,
                                assetType: item.supportChain.ETH.assetType as ExternalAssetType,
                            });
                            totalStaked += await getETHContractBalance(item.supportChain.ETH.depositAddress, item.supportChain.ETH.contract);
                        }
                        if (item.supportChain.BSC) {
                            externalChainInfo.push({
                                chainName: ExternalChainName.BSC,
                                assetType: item.supportChain.BSC.assetType as ExternalAssetType,
                            });
                            totalStaked += await getBSCContractBalance(item.supportChain.BSC.depositAddress, item.supportChain.BSC.contract);
                        }
                        if (item.supportChain.TRON) {
                            externalChainInfo.push({
                                chainName: ExternalChainName.TRON,
                                assetType: item.supportChain.TRON.assetType as ExternalAssetType,
                            });
                            totalStaked += await getTRONContractBalance(item.supportChain.TRON.depositAddress, item.supportChain.TRON.contract);
                        }
                        const result = await walletServerSdk.getAssetDetails({ chainName, assetType });
                        poolInfo.push({
                            /**内链名 */
                            chainName: item.chainName,
                            /**内链资产名 */
                            assetType: item.assetType,
                            /**支持的外链 */
                            externalChainInfo,
                            /**总铸造量 */
                            totalMinted: result.issuedAssetPrealnum,
                            /**当前流通总量 */
                            totalCirculation: result.remainAssetPrealnum,
                            /**总销毁量 */
                            totalBurned: (BigInt(result.issuedAssetPrealnum) - BigInt(result.remainAssetPrealnum)).toString(),
                            /**总质押量 */
                            totalStaked: totalStaked.toString(),
                        });
                    };
                    pAll.push(_func(chainName, assetType));
                } catch (err) {
                    Logger.warn(err);
                }
            }
        }
        await Promise.all(pAll);
        return { poolInfo };
    }

    async rechargeV2(dto: RechargeV2ReqDto): Promise<COTCore.Recharge.Api.RechargeResDto> {
        const { fromTrJson, message } = dto;
        // 获取交易详情
        const detail = await this.__getRechargeTransDetailV2(fromTrJson, message);
        // 验证充值参数
        await this.__verifyRechargeParamV2(detail);
        // 创建订单
        const order = await this.__createRechargeOrderV2(detail, fromTrJson);
        await this.__createRechargeAirDropOrderV2(detail, fromTrJson);
        return { orderId: order.entityId };
    }

    /**
     * 获取充值交易详情
     * @param fromTrJson
     * @param toTrInfo
     */
    private async __getRechargeTransDetailV2(
        fromTrJson: WalletTypings.ExternalChain.FromTrJson,
        toTrInfo: COTCore.Recharge.RechargeV2ToTrInfoData,
    ): Promise<COTServer.Recharge.TransDetail> {
        if (await RechargeHelper.isRechargeDevTest()) {
            const amount = (CommonHelper.random(1, 10) * 100000000).toString();
            return {
                fromDetail: {
                    chainName: ExternalChainName.ETH,
                    from: "0x785f8ee0c83ab7cf398008d0428233fc17735521",
                    to: "0xf563CEa8C4777E2E32629a9FBba7B1E91C182e56",
                    amount,
                    txHash: CommonHelper.getUuid(),
                },
                toDetail: toTrInfo,
                fromAssetSymbol: "USDT",
                fromDecimals: 18,
                toAmount: BigInt(amount),
            };
        }
        const recharge = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        const { chainName: toChain, address, assetType } = toTrInfo;
        const rechargeObject = RechargeHelper.checkChainAssetItem(recharge, toChain, assetType);
        if (!toChain || !address) {
            throw Error(`<${this.__orderType}> toTrInfo chainName:${toChain} or address:${address} is undefined`);
        }
        if (!rechargeObject.enable) {
            throw new Error(`[${toChain}] recharge is close`);
        }
        const fromDetail = await OrderHelper.getExternalChainDetail(fromTrJson, rechargeObject);
        if (!fromDetail) {
            throw Error(`getExternalChainDetail error. ${JSON.stringify(fromTrJson, null, 2)}`);
        }
        const { chainName, contractAddress, amount } = fromDetail;
        let symbol: string;
        let decimals: number;
        if (!contractAddress) {
            switch (chainName) {
                case ExternalChainName.BSC:
                    symbol = ExternalMainAssetType.BNB;
                    decimals = 18;
                    break;
                case ExternalChainName.ETH:
                    symbol = ExternalMainAssetType.ETH;
                    decimals = 18;
                    break;
                case ExternalChainName.TRON:
                    symbol = ExternalMainAssetType.TRX;
                    decimals = 6;
                    break;
                default:
                    throw Error(`chainName ${chainName} is not support`);
            }
            // // 主币交易，未开放
            // throw Error(`recharge by no contract trans is not support`);
        } else {
            const info = await OrderHelper.getContractTokenInfo(chainName, contractAddress);
            symbol = info.symbol;
            decimals = info.decimals;
        }
        return {
            fromDetail,
            toDetail: toTrInfo,
            fromAssetSymbol: symbol,
            fromDecimals: decimals,
            toAmount: ExternalChainHelper.transformDecimalToBCF(decimals, amount),
        };
    }

    /**
     * 验证充值参数
     * @param authorization
     * @param detail
     */
    private async __verifyRechargeParamV2(detail: COTServer.Recharge.TransDetail) {
        const { fromDetail, toDetail } = detail;
        const recharge = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        // 验证充值交易详情
        RechargeHelper.verifyRechargeTransDetailV2(detail, recharge);
        // 验证地址余额
        await this.__verifyBalance(detail);
    }

    /**
     * 创建充值订单
     * @param internalAddress
     * @param fromTrJson
     */
    private async __createRechargeOrderV2(detail: COTServer.Recharge.TransDetail, fromTrJson: WalletTypings.ExternalChain.FromTrJson) {
        const { fromDetail, toDetail, fromAssetSymbol, fromDecimals, toAmount } = detail;
        const order = new RechargeOrder();
        order.state = RECHARGE_ORDER_STATE_ID.INIT;
        // 保存外链交易，获取txId
        order.walletTxId = await this.__createExternalTrans(order.entityId, fromTrJson, detail);
        order.walletChain = fromDetail.chainName;
        order.walletAddress = fromDetail.from;
        order.walletAmount = fromDetail.amount;
        order.walletAsset = fromAssetSymbol;
        order.walletDecimals = fromDecimals;
        order.contractAddress = fromDetail.contractAddress;
        order.internalChain = toDetail.chainName;
        order.internalAddress = toDetail.address;
        // rechargeTxId先用entityId保证唯一索引
        order.rechargeAmount = toAmount;
        order.rechargeTxId = order.entityId;
        order.rechargeAssetType = toDetail.assetType;
        order.rechargeType = RECHARGE_TYPE.ISSUE;
        // 保存订单
        await this.__rechargeOrderRepository.save(order);
        return order;
    }
    /**
     * 创建充值订单
     * @param internalAddress
     * @param fromTrJson
     */
    private async __createRechargeAirDropOrderV2(detail: COTServer.Recharge.TransDetail, fromTrJson: WalletTypings.ExternalChain.FromTrJson) {
        const { fromDetail, toDetail, fromAssetSymbol, fromDecimals, toAmount } = detail;
        const internalChain = toDetail.chainName;
        const internalAddress = toDetail.address;
        const mainAssetType = RechargeHelper.getRechargeMainAssetType(internalChain);
        const balance = await walletServerSdk.getInternalAccountBalance({
            /**链名 */
            chainName: internalChain,
            /**用户地址 */
            address: internalAddress,
            /**资产类型 */
            assetType: mainAssetType,
        });
        if (BigInt(balance.amount) > BigInt(0)) {
            return;
        }
        const _airdrop = await this.__rechargeOrderRepository.findOne({ where: { internalAddress: toDetail.address, rechargeType: RECHARGE_TYPE.AIRDROP } });
        if (!_airdrop) {
            const order = new RechargeOrder();
            order.state = RECHARGE_ORDER_STATE_ID.INIT;
            order.walletTxId = order.entityId;
            order.internalChain = internalChain;
            order.internalAddress = internalAddress;
            // rechargeTxId先用entityId保证唯一索引
            order.rechargeAmount = BigInt(1000000);
            order.rechargeTxId = order.entityId;
            order.rechargeAssetType = mainAssetType;
            order.rechargeType = RECHARGE_TYPE.AIRDROP;
            // 保存订单
            await this.__rechargeOrderRepository.save(order);
        }
    }
}
