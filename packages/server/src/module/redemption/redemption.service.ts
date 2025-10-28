import { REDEMPTION_ORDER_STATE_ID, ExternalAssetType, InternalChainName, InternalTransStateID, REDEMPTION_TYPE } from "@bnqkl/cotcore";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { $asyncAllNoNullMap, ExternalChainHelper, BCF_DEFAULT_DECIMALS, Logger, InternalAssetType, JSBIHelper, ExternalChainName } from "@bnqkl/wallet-sdk";
import { RedemptionOrder, LOCAL_MQ_ID, ORDER_TYPE, TRANSACTION_LINK_TYPE } from "../../common";
import { GlobalValueRedisRepository } from "../redis/global-value.redis-repository";
import { RedemptionRecordsReqDto, RedemptionV2ReqDto } from "./dto";
import { RedemptionOrderRepository } from "./redemption.repository";
import { VerifyHelper, OrderHelper, RedemptionHelper, RechargeHelper, walletServerSdk } from "../../helper";
import { MemoryService } from "../memory/memory.service";

@Injectable()
export class RedemptionService {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;
    @Inject(forwardRef(() => RedemptionOrderRepository))
    private __redemptionOrderRepository!: RedemptionOrderRepository;
    @Inject(forwardRef(() => MemoryService))
    private __memoryService!: MemoryService;

    private __orderType = ORDER_TYPE.REDEMPTION;

    /**
     * 验证地址余额
     * @param detail
     */
    private async __verifyBalance(detail: COTServer.Redemption.TransDetail) {
        const { fromDetail, toDetail, toAmount } = detail;
        // 验证内链
        const result = await walletServerSdk.getInternalAccountBalance({
            chainName: fromDetail.chainName,
            address: fromDetail.from,
            assetType: fromDetail.assetType,
        });
        const internalBalance = BigInt(result.amount);
        if (internalBalance < BigInt(fromDetail.amount)) {
            throw Error(`address:${fromDetail.from} internalBalance:${internalBalance} is less than amount:${fromDetail.amount}`);
        }
        // 验证外链
        if (await RedemptionHelper.isRedemptionDevTest()) {
            return;
        }
        const { chainName, contractAddress, assetType } = toDetail;
        const address = await this.__globalValueRedisRepository.getInjectExternalAddress(chainName, assetType);
        let balanceAmount: string;
        if (contractAddress) {
            const balanceItem = await walletServerSdk.getExternalAccountBalance({ chainName, address, contractAddress });
            balanceAmount = balanceItem.amount;
        } else {
            balanceAmount = await walletServerSdk.getExternalBalance({ chainName, address });
        }
        const externalBalance = BigInt(balanceAmount);
        if (externalBalance < toAmount) {
            throw Error(`walletChain:${chainName} address:${address} externalBalance:${externalBalance} is less than amount:${toAmount}`);
        }
    }

    /**
     * 赎回订单重试内链上链
     * @param orderId
     * @param authorization
     */
    async retryInternalOnChain(orderId: string) {
        const { internalChain, internalAddress, redemptionTxId } = await this.__redemptionOrderRepository.findOneByForce({
            entityId: orderId,
            state: REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL,
        });
        const updateTransSuccess = await walletServerSdk.updateInternalTransState({
            chainName: internalChain,
            txId: redemptionTxId,
            state: InternalTransStateID.INIT,
        });
        if (!updateTransSuccess) {
            throw Error(`<${this.__orderType}> update [${internalChain}] txId:${redemptionTxId} to state:${InternalTransStateID.INIT} fail`);
        }
        const { affected } = await this.__redemptionOrderRepository.update(
            { entityId: orderId, state: REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL },
            { state: REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN },
        );
        if (!affected) {
            throw Error(
                `<${this.__orderType}> update orderId:${orderId} state:${REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL} to state:${REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN} fail`,
            );
        }
        await OrderHelper.createRedemptionOrderObj(orderId);
        return true;
    }

    /**
     * 赎回订单重试外链上链
     * @param orderId
     * @param authorization
     */
    async retryExternalOnChain(orderId: string) {
        const { affected } = await this.__redemptionOrderRepository.update(
            { entityId: orderId, state: REDEMPTION_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL },
            { state: REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN },
        );
        if (!affected) {
            throw Error(
                `<${this.__orderType}> update orderId:${orderId} state:${REDEMPTION_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL} to state:${REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN} fail`,
            );
        }
        await OrderHelper.createRedemptionOrderObj(orderId);
        return true;
    }

    /**
     * 获取赎回记录列表
     * @param authorization
     * @param dto
     * @returns
     */
    async getRecords(dto: RedemptionRecordsReqDto): Promise<COTCore.Redemption.Api.RedemptionRecordsResDto> {
        const { internalChain, internalAddress, page, pageSize } = dto;
        const result = await this.__redemptionOrderRepository.findByPage({ where: { internalChain, internalAddress }, order: { id: "DESC" } }, page, pageSize);
        const realDataList = await $asyncAllNoNullMap(
            result.dataList,
            async ({
                entityId,
                state,
                internalChain,
                redemptionAmount,
                redemptionFee,
                walletChain,
                walletAmount,
                walletAsset,
                contractAddress,
                createdTime,
                redemptionAssetType,
            }) => {
                let fromDecimals = BCF_DEFAULT_DECIMALS;
                const fromTxInfo: WalletTypings.Order.RecordTxInfo = {
                    chainName: internalChain,
                    amount: redemptionAmount.toString(),
                    asset: redemptionAssetType,
                    decimals: fromDecimals,
                };
                let toDecimals = BCF_DEFAULT_DECIMALS;
                if (contractAddress) {
                    const info = await OrderHelper.getContractTokenInfo(walletChain, contractAddress);
                    toDecimals = info.decimals;
                } else {
                    toDecimals = RedemptionHelper.getMainAssetDecimals(walletChain);
                }
                const toTxInfo: WalletTypings.Order.RecordTxInfo = { chainName: walletChain, amount: walletAmount, asset: walletAsset, decimals: toDecimals };
                const record: COTCore.Redemption.RedemptionRecord = {
                    orderId: entityId,
                    state: RedemptionHelper.getRecordState(state),
                    orderState: state,
                    fromTxInfo,
                    toTxInfo,
                    redemptionFee: redemptionFee.toString(),
                    createdTime,
                };
                return record;
            },
        );
        const pageData = result.replaceDataList(realDataList);
        return pageData;
    }

    /**
     * 获取赎回记录详情
     * @param authorization
     * @param orderId
     * @returns
     */
    async getRecordDetail(orderId: string): Promise<COTCore.Redemption.Api.RedemptionRecordDetailResDto> {
        const { state, internalChain, internalAddress, redemptionTxId, redemptionRatio, walletChain, walletTxId, walletAddress, contractAddress, updatedTime } =
            await this.__redemptionOrderRepository.findOneByForce({
                entityId: orderId,
            });
        const { txHash, failReason, feeInfo } = await OrderHelper.getTxInfo(internalChain, redemptionTxId);
        const fromTxInfo: WalletTypings.Order.RecordDetailTxInfo = {
            chainName: internalChain,
            address: internalAddress,
            txId: redemptionTxId,
            txHash,
            feeInfo,
        };
        // 订单失败原因
        let orderFailReason = failReason;
        const toTxInfo: WalletTypings.Order.RecordDetailTxInfo = { chainName: walletChain, address: walletAddress, contractAddress };
        if (walletTxId !== orderId) {
            const { txHash, failReason, feeInfo } = await OrderHelper.getTxInfo(walletChain, walletTxId);
            toTxInfo.txId = walletTxId;
            toTxInfo.txHash = txHash;
            toTxInfo.feeInfo = feeInfo;
            orderFailReason = failReason;
        }
        const detail: COTCore.Redemption.Api.RedemptionRecordDetailResDto = {
            state: RedemptionHelper.getRecordState(state),
            orderState: state,
            redemptionRatio,
            fromTxInfo,
            toTxInfo,
            orderFailReason,
            updatedTime,
        };
        return detail;
    }

    /**
     * 赎回
     * @param authorization
     * @param dto
     * @returns
     */
    async redemptionV2(dto: RedemptionV2ReqDto): Promise<COTCore.Redemption.Api.RedemptionV2ResDto> {
        const { fromTrJson } = dto;
        // 获取交易详情
        const detail = await this.__getRedemptionTransDetailV2(fromTrJson);
        // 验证赎回参数
        await this.__verifyRedemptionParamV2(detail);
        // 创建订单
        const order = await this.__createRedemptionOrderV2(detail, fromTrJson);
        return { orderId: order.entityId };
    }

    /**
     * 获取赎回交易详情
     * @param fromTrJson
     */
    private async __getRedemptionTransDetailV2(fromTrJson: COTCore.Redemption.RedemptionV2Tr): Promise<COTServer.Redemption.TransDetail> {
        const rechargeConfig = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        const detail = OrderHelper.getInternalChainDestroyAssetDetail(fromTrJson);
        if (!detail) {
            throw Error(`getInternalChainDetail error. ${JSON.stringify(fromTrJson, null, 2)}`);
        }
        const rechargeObject = RechargeHelper.checkChainAssetItem(rechargeConfig, detail.detail.chainName, detail.detail.assetType);
        const { detail: fromDetail, trJson } = detail;
        const toDetail = RedemptionHelper.getToTrDetail(trJson, rechargeObject);
        const { chainName, contractAddress } = toDetail;
        if (!rechargeObject.redemption.enable) {
            throw new Error(`redemption is close`);
        }
        const redemption = rechargeObject.redemption;
        let decimals: number;
        if (contractAddress) {
            const info = await OrderHelper.getContractTokenInfo(chainName, contractAddress);
            decimals = info.decimals;
        } else {
            decimals = RedemptionHelper.getMainAssetDecimals(chainName);
            // 主币交易，未开放
            // throw Error(`redemption by no contract trans is not support`);
        }
        const { amount, assetType } = fromDetail;
        // 获取赎回比例和手续费
        const minusFeeRatio = JSBIHelper.toFraction(redemption.radioFee.toString());
        const redemptionFee = BigInt(redemption.fee[chainName]);
        const minusFee = (BigInt(amount) * BigInt(minusFeeRatio.numerator)) / BigInt(minusFeeRatio.denominator);
        const walletAmount = BigInt(amount) - BigInt(redemptionFee) - BigInt(minusFee);
        if (walletAmount <= BigInt(0)) {
            throw Error(` walletAmount:${walletAmount} < 0 amount:${amount} minusFee:${minusFee.toString()} < redemptionFee:${redemptionFee}`);
        }
        return {
            fromDetail,
            toDetail,
            toAmount: ExternalChainHelper.transformDecimalToContract(decimals, walletAmount.toString()),
            redemptionRatio: minusFeeRatio,
            redemptionFee,
        };
    }

    /**
     * 验证赎回参数
     * @param detail
     */
    private async __verifyRedemptionParamV2(detail: COTServer.Redemption.TransDetail) {
        const { fromDetail, toDetail } = detail;
        await VerifyHelper.verifyExternalAddress(toDetail.chainName, toDetail.address);
        const rechargeConfig = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
        const rechargeObject = RechargeHelper.checkChainAssetItem(rechargeConfig, fromDetail.chainName, fromDetail.assetType);
        // 验证赎回交易详情
        RedemptionHelper.verifyRedemptionTransDetailV2(detail, rechargeObject);
        // 验证地址余额
        await this.__verifyBalance(detail);
    }

    /**
     * 创建赎回订单
     * @param detail
     * @param fromTrJson
     */
    private async __createRedemptionOrderV2(detail: COTServer.Redemption.TransDetail, fromTrJson: COTCore.Redemption.RedemptionV2Tr) {
        const { fromDetail, toDetail, toAmount, redemptionRatio, redemptionFee } = detail;
        const order = new RedemptionOrder();
        order.state = REDEMPTION_ORDER_STATE_ID.INIT;
        order.internalChain = fromDetail.chainName;
        order.internalAddress = fromDetail.from;
        // 保存支付链交易，获取txId
        order.redemptionTxId = await this.__createInternalDestroyAssetTrans(order.entityId, fromTrJson, fromDetail.chainName);
        order.redemptionAmount = BigInt(fromDetail.amount);
        order.redemptionRatio = Number(redemptionRatio.numerator) / Number(redemptionRatio.denominator);
        order.redemptionAssetType = fromDetail.assetType as InternalAssetType;
        order.redemptionFee = redemptionFee;
        // walletTxId先用entityId保证唯一索引
        order.walletTxId = order.entityId;
        order.walletChain = toDetail.chainName;
        order.walletAddress = toDetail.address;
        order.contractAddress = toDetail.contractAddress;
        order.walletAmount = toAmount.toString();
        order.walletAsset = toDetail.assetType;
        order.redemptionType = REDEMPTION_TYPE.DESTROY;
        // 保存订单
        await this.__redemptionOrderRepository.save(order);
        return order;
    }

    /**
     * 创建内链交易
     * @param orderId
     * @param fromTrJson
     * @param internalChain
     * @returns
     */
    private async __createInternalDestroyAssetTrans(
        orderId: string,
        fromTrJson: COTCore.Redemption.RedemptionV2Tr,
        internalChain: InternalChainName,
    ): Promise<string> {
        const getTrJson: () => WalletTypings.InternalChain.DestroyAssetTransaction = () => {
            const bcfTrans = fromTrJson.bcf;
            if (!bcfTrans) {
                throw Error(`__createInternalTrans bcfTrans undefined`);
            }
            return bcfTrans.trJson;
        };
        const { txId } = await walletServerSdk.saveInternalTransaction({
            chainName: internalChain,
            transactionJSON: getTrJson(),
            param: {
                mqId: LOCAL_MQ_ID,
                linkType: TRANSACTION_LINK_TYPE.REDEMPTION_ORDER,
                linkId: orderId,
            },
        });
        return txId;
    }
}
