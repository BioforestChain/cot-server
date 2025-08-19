import type { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cot-core";
import { Logger, OrderObj } from "@bnqkl/wallet-sdk";
import type { RedemptionOrder } from "../../../common/index.js";
import type { RedemptionOrderRepository } from "../redemption.repository.js";
import type { RedemptionOrderMgr } from "./redemption-order-mgr.js";
import type { RedemptionOrderState } from "./state/index.js";

/**赎回订单的逻辑对象 */
export class RedemptionOrderObj extends OrderObj<REDEMPTION_ORDER_STATE_ID, RedemptionOrderState, RedemptionOrder> implements COTServer.Redemption.OrderObj {
    constructor(order: RedemptionOrder, redemptionOrderMgr: RedemptionOrderMgr, repository: RedemptionOrderRepository) {
        super(order, redemptionOrderMgr, repository);
    }

    /**内链名 */
    get internalChain() {
        return this.entity.internalChain;
    }
    /**内链地址 */
    get internalAddress() {
        return this.entity.internalAddress;
    }

    /**内链redemption转账事件id */
    get redemptionTxId() {
        return this.entity.redemptionTxId;
    }
    set redemptionTxId(txId: string) {
        this.entity.redemptionTxId = txId;
    }

    /**赎回redemption数量 */
    get redemptionAmount() {
        return this.entity.redemptionAmount;
    }

    /**外链交易id */
    get walletTxId() {
        return this.entity.walletTxId;
    }
    set walletTxId(hash: string) {
        this.entity.walletTxId = hash;
    }

    /**外链名 */
    get walletChain() {
        return this.entity.walletChain;
    }

    /**合约地址 */
    get contractAddress() {
        return this.entity.contractAddress;
    }

    /**外链接收地址 */
    get walletAddress() {
        return this.entity.walletAddress;
    }

    /**赎回资产数量 */
    get walletAmount() {
        return this.entity.walletAmount;
    }
    set walletAmount(amount: string) {
        this.entity.walletAmount = amount;
    }

    /**赎回资产类型 */
    get walletAsset() {
        return this.entity.walletAsset;
    }
}
