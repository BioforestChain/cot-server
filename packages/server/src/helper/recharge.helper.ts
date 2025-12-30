import { RECHARGE_RECORD_STATE, RECHARGE_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { RECHARGE_DEV_TEST_KEY } from "../common";
import { compareTwoStrLowerCase, InternalAssetType, InternalChainName, redisCore, TOKEN_TO_BEN } from "@bnqkl/wallet-sdk";

export class RechargeHelper {
    /**
     * 是否测试充值模式
     */
    static async isRechargeDevTest() {
        if (process.env.NODE_ENV !== "dev") {
            return false;
        }
        if (!(await redisCore.redis.exists(RECHARGE_DEV_TEST_KEY))) {
            return false;
        }
        if ((await redisCore.redis.get(RECHARGE_DEV_TEST_KEY)) === "0") {
            return false;
        }
        return true;
    }

    /**
     * 获取充值记录状态
     * @param orderState
     * @returns
     */
    static getRecordState(orderState: RECHARGE_ORDER_STATE_ID): RECHARGE_RECORD_STATE {
        switch (orderState) {
            case RECHARGE_ORDER_STATE_ID.INIT:
            case RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN:
                return RECHARGE_RECORD_STATE.PENDING;
            case RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN:
                return RECHARGE_RECORD_STATE.TO_BE_POSTED;
            case RECHARGE_ORDER_STATE_ID.SUCCESS:
                return RECHARGE_RECORD_STATE.POSTED;
            case RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL:
            case RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL:
                return RECHARGE_RECORD_STATE.FAIL;
            default:
                break;
        }
        throw Error(`<recharge> getRecordState error. orderState:${orderState} is wrong`);
    }

    /**
     * 获取充值订单状态数组
     * @param recordState
     * @returns
     */
    static getOrderStateArray(recordState: RECHARGE_RECORD_STATE): RECHARGE_ORDER_STATE_ID[] {
        switch (recordState) {
            case RECHARGE_RECORD_STATE.PENDING:
                return [RECHARGE_ORDER_STATE_ID.INIT, RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN];
            case RECHARGE_RECORD_STATE.TO_BE_POSTED:
                return [RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN];
            case RECHARGE_RECORD_STATE.POSTED:
                return [RECHARGE_ORDER_STATE_ID.SUCCESS];
            case RECHARGE_RECORD_STATE.FAIL:
                return [RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL, RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL];
            default:
                break;
        }
        throw Error(`<recharge> getOrderStateArray error. recordState:${recordState} is wrong`);
    }

    static checkChainAssetItem(recharge: COTCore.Config.BusinessConfig["recharge"], chainName: string, assetType: string) {
        if (!recharge[chainName]) {
            throw Error(`<recharge> config error. chainName: ${chainName} `);
        }
        if (!recharge[chainName][assetType]) {
            throw Error(`<recharge> config error. chainName: ${chainName} assetType: ${assetType} `);
        }
        return recharge[chainName][assetType];
    }

    /**
     * 验证充值交易详情
     * @param detail
     * @param config
     */
    static verifyRechargeTransDetailV2(detail: COTServer.Recharge.TransDetail, recharge: COTCore.Config.BusinessConfig["recharge"]) {
        const fromAssetSymbol = detail.fromAssetSymbol;
        const { chainName, to, contractAddress } = detail.fromDetail;
        const { chainName: internalChain, assetType: toAssetType } = detail.toDetail;
        const rechargeItem = this.checkChainAssetItem(recharge, internalChain, toAssetType);

        if (!rechargeItem.supportChain[chainName]) {
            throw Error(`verifyRechargeTransDetail ${chainName} ${fromAssetSymbol}  not support `);
        }
        const supportItem = rechargeItem.supportChain[chainName];
        if (!compareTwoStrLowerCase(supportItem.depositAddress, to)) {
            throw Error(`recharge verify depositInfo fail. to:${to}`);
        }
        if (supportItem.contract) {
            console.log(supportItem);
            if (!contractAddress) {
                throw new Error(`recharge verify depositInfo fail. contractAddress:${contractAddress} empty`);
            }
            if (!compareTwoStrLowerCase(supportItem.contract, contractAddress)) {
                throw new Error(`recharge verify depositInfo fail. contractAddress:${contractAddress} !== ${supportItem.contract}`);
            }
        } else {
            // throw Error(`recharge not support main coin`);
        }
    }

    static getRechargeMainAssetType(chainName: InternalChainName) {
        switch (chainName) {
            case InternalChainName.PMCHAIN:
                return InternalAssetType.PMC;
            case InternalChainName.BIWMETA:
                return InternalAssetType.BIW;
            case InternalChainName.BFMCHAIN:
                return InternalAssetType.BFM;
            case InternalChainName.BFCHAINV2:
                return InternalAssetType.BFT;
            case InternalChainName.CCCHAIN:
                return InternalAssetType.CCC;
            case InternalChainName.ETHMETA:
                return InternalAssetType.ETHM;
            case InternalChainName.BTGMETA:
                return InternalAssetType.BTGM;
            case InternalChainName.BFMETAV2:
                return InternalAssetType.BFM;
            default:
                throw Error(`not support ${chainName}`);
        }
    }
}
