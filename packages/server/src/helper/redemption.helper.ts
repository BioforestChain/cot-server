import { REDEMPTION_DEV_TEST_KEY } from "../common/index.js";
import { ExternalChainName, redisCore, timeTool } from "@bnqkl/wallet-sdk";
import { REDEMPTION_ORDER_STATE_ID, REDEMPTION_RECORD_STATE } from "@bnqkl/cot-core";

export class RedemptionHelper {
    /**
     * 是否测试赎回模式
     */
    static async isRedemptionDevTest() {
        if (process.env.NODE_ENV !== "dev") {
            return false;
        }
        if (!(await redisCore.redis.exists(REDEMPTION_DEV_TEST_KEY))) {
            return false;
        }
        if ((await redisCore.redis.get(REDEMPTION_DEV_TEST_KEY)) === "0") {
            return false;
        }
        return true;
    }

    /**
     * 获取赎回接收方交易详情
     * @param transactionJSON
     * @param depositSupport
     * @returns
     */
    static getToTrDetail(
        transactionJSON: WalletTypings.InternalChain.TransferAssetTransaction | WalletTypings.InternalChain.DestroyAssetTransaction,
        rechargeObject: COTCore.Config.RechargeItem,
    ): WalletTypings.ExternalChain.ToTrDetail {
        const { chainName, address, assetType } = transactionJSON.remark as unknown as COTCore.Redemption.TransRemark;
        if (!chainName || !address || !assetType) {
            throw Error(`getToTrDetail fail. chainName:${chainName} or address:${address} or assetType:${assetType} is undefined`);
        }
        if (!rechargeObject.supportChain[chainName]) {
            throw Error(`supportChain not support chainName ${chainName}  `);
        }
        return {
            chainName,
            address,
            assetType,
            contractAddress: rechargeObject.supportChain[chainName].contract,
        };
    }

    /**
     * 获取赎回记录状态
     * @param orderState
     * @returns
     */
    static getRecordState(orderState: REDEMPTION_ORDER_STATE_ID): REDEMPTION_RECORD_STATE {
        switch (orderState) {
            case REDEMPTION_ORDER_STATE_ID.INIT:
            case REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN:
                return REDEMPTION_RECORD_STATE.PENDING;
            case REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN:
                return REDEMPTION_RECORD_STATE.TO_BE_POSTED;
            case REDEMPTION_ORDER_STATE_ID.SUCCESS:
                return REDEMPTION_RECORD_STATE.POSTED;
            case REDEMPTION_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL:
            case REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL:
                return REDEMPTION_RECORD_STATE.FAIL;
            default:
                break;
        }
        throw Error(`<redemption> getRecordState error. orderState:${orderState} is wrong`);
    }

    /**
     * 验证赎回交易详情
     * @param detail
     * @param config
     */
    static verifyRedemptionTransDetailV2(detail: COTServer.Redemption.TransDetail, rechargeObject: COTCore.Config.RechargeItem) {
        const { min, max } = rechargeObject.redemption;
        const { to, amount: fromAmount } = detail.fromDetail;
        if (to !== rechargeObject.applyAddress) {
            throw Error(`Redemption to:${to} is not platform address ${rechargeObject.applyAddress}`);
        }
        // 验证资产数量
        if (BigInt(fromAmount) < BigInt(min)) {
            throw Error(`<redemption> amount:${fromAmount} can't less than ${BigInt(min)}`);
        }
        if (BigInt(fromAmount) > BigInt(max)) {
            throw Error(`<redemption> amount:${fromAmount} can't more than ${BigInt(max)}`);
        }
        const item = rechargeObject.supportChain[detail.toDetail.chainName];
        if (item) {
            if (!(item.assetType === detail.toDetail.assetType)) {
                throw Error(`<redemption> assetType wrong ${detail.toDetail.assetType}`);
            }
        } else {
            throw Error(`<redemption> not support ${detail.toDetail.chainName}`);
        }
    }

    static getMainAssetDecimals(chainName: ExternalChainName) {
        let decimals: number;
        switch (chainName) {
            case ExternalChainName.BSC:
                decimals = 18;
                break;
            case ExternalChainName.ETH:
                decimals = 18;
                break;
            case ExternalChainName.TRON:
                decimals = 6;
                break;
            default:
                throw Error(`chainName ${chainName} is not support`);
        }
        return decimals;
    }
}
