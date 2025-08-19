import type {
    InternalChainName} from "@bnqkl/wallet-sdk";
import {
    ChainHelper,
    ExternalChainName,
    ExternalTransStateID,
    InternalAssetType,
    InternalMainAssetType,
    Logger,
    memTimeCache,
    MEM_TIME_CACHE_STRATEGY,
} from "@bnqkl/wallet-sdk";
import { CMD, WORKER } from "../common/index.js";
import { externalChainHelper, internalChainHelper, ipcHelpers, walletServerSdk } from "../helper/index.js";

export class OrderHelper {
    /**
     * 生成充值订单逻辑对象
     * @param orderId
     */
    static async createRechargeOrderObj(orderId: string): Promise<void> {
        if (!(await ipcHelpers.request(`${WORKER.ORDER}`, CMD.CREATE_RECHARGE_ORDER_OBJ, { orderId }))) {
            Logger.warn(`${CMD.CREATE_RECHARGE_ORDER_OBJ} orderId:${orderId} fail`);
        }
    }

    /**
     * 生成赎回订单逻辑对象
     * @param orderId
     */
    static async createRedemptionOrderObj(orderId: string): Promise<void> {
        if (!(await ipcHelpers.request(`${WORKER.ORDER}`, CMD.CREATE_REDEMPTION_ORDER_OBJ, { orderId }))) {
            Logger.warn(`${CMD.CREATE_REDEMPTION_ORDER_OBJ} orderId:${orderId} fail`);
        }
    }

    /**
     * 获取外链交易详情
     * @param fromTrJson
     * @param chainConfig
     * @returns
     */
    static async getExternalChainDetail(
        fromTrJson: WalletTypings.ExternalChain.FromTrJson,
        rechargeItem: COTCore.Config.RechargeItem,
    ): Promise<WalletTypings.ExternalChain.TransDetail | undefined> {
        const { eth, bsc, trc20, tron } = fromTrJson;
        if (eth) {
            if (rechargeItem.supportChain && rechargeItem.supportChain.ETH && rechargeItem.supportChain.ETH.enable) {
                return externalChainHelper.getEthTransDetail(eth.signTransData);
            } else {
                throw new Error(`eth close`);
            }
        } else if (bsc) {
            if (rechargeItem.supportChain && rechargeItem.supportChain.BSC && rechargeItem.supportChain.BSC.enable) {
                return externalChainHelper.getBscTransDetail(bsc.signTransData);
            } else {
                throw new Error(`bsc close`);
            }
        } else if (trc20) {
            if (rechargeItem.supportChain && rechargeItem.supportChain.TRON && rechargeItem.supportChain.TRON.enable) {
                return await externalChainHelper.getTronTransDetail(trc20);
            } else {
                throw new Error(`tron close`);
            }
        } else if (tron) {
            if (rechargeItem.supportChain && rechargeItem.supportChain.TRON && rechargeItem.supportChain.TRON.enable) {
                return await externalChainHelper.getTronTransDetail(tron);
            } else {
                throw new Error(`tron close`);
            }
        }
    }

    /**
     * 获取内链交易详情
     * @param fromTrJson
     * @param chainConfig
     * @returns
     */
    static getInternalChainDestroyAssetDetail(
        fromTrJson: COTCore.Redemption.RedemptionV2Tr,
    ): { detail: WalletTypings.InternalChain.TransDetail; trJson: WalletTypings.InternalChain.DestroyAssetTransaction } | undefined {
        const { bcf } = fromTrJson;
        if (!bcf) {
            return;
        }
        const { chainName, trJson } = bcf;
        return {
            detail: internalChainHelper.getDestroyAssetTransDetail(chainName, trJson),
            trJson,
        };
    }

    /**
     * 获取合约token信息
     * @param chainName
     * @param contractAddress
     * @returns
     */
    @memTimeCache({ time: MEM_TIME_CACHE_STRATEGY.FOREVER })
    static async getContractTokenInfo(chainName: ExternalChainName, contractAddress: string) {
        return await walletServerSdk.getContractTokenInfo({ chainName, contractAddress });
    }

    /**
     * 获取交易信息
     * @param chainName
     * @param txId
     * @returns
     */
    static async getTxInfo(
        chainName: ExternalChainName | InternalChainName,
        txId: string,
    ): Promise<{ txHash: string; failReason?: string; feeInfo?: WalletTypings.TransFeeInfo }> {
        if (chainName in ExternalChainName) {
            const { state, txHash, failReason } = await walletServerSdk.getExternalTrans({ chainName: chainName as ExternalChainName, txId });
            if (state !== ExternalTransStateID.SUCCESS) {
                return { txHash, failReason };
            }
            const feeInfo = await walletServerSdk.getExternalTransFeeInfo({ chainName: chainName as ExternalChainName, txId });
            return { txHash, feeInfo };
        }
        const { signature, trJson, failReason } = await walletServerSdk.getInternalTrans({ chainName: chainName as InternalChainName, txId });
        return {
            txHash: signature,
            failReason,
            feeInfo: { fee: trJson.fee },
        };
    }
}
