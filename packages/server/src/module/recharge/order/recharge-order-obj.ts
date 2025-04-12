import { INTERNAL_CHAIN_RW_ACCOUNT_TYPE, RECHARGE_ORDER_STATE_ID } from "@cot/core";
import { RechargeOrder } from "../../../common";
import { INTERNAL_TRANS_RETRY_MAX_NUM, Logger, OrderObj } from "@bnqkl/wallet-sdk";
import { RechargeOrderRepository } from "../recharge.repository";
import { RechargeOrderMgr } from "./recharge-order-mgr";
import { RechargeOrderState } from "./state";

/**充值订单的逻辑对象 */
export class RechargeOrderObj extends OrderObj<RECHARGE_ORDER_STATE_ID, RechargeOrderState, RechargeOrder> implements COTServer.Recharge.OrderObj {
    /**recharge转账事件重试时间戳 */
    public retryRechargeTxStamp?: number;
    /**recharge转账事件重试次数 */
    public retryRechargeTxNum = 0;

    constructor(order: RechargeOrder, rechargeOrderMgr: RechargeOrderMgr, repository: RechargeOrderRepository) {
        super(order, rechargeOrderMgr, repository);
    }

    get walletChain() {
        return this.entity.walletChain;
    }

    /**充值的外链交易唯一id */
    get walletTxId() {
        return this.entity.walletTxId;
    }

    /**充值类型 */
    get rechargeType() {
        return this.entity.rechargeType;
    }

    /**内链名 */
    get internalChain() {
        return this.entity.internalChain;
    }

    /**内链接收地址 */
    get internalAddress() {
        return this.entity.internalAddress;
    }

    /**内链recharge转账事件id */
    get rechargeTxId() {
        return this.entity.rechargeTxId;
    }
    set rechargeTxId(txId: string) {
        this.entity.rechargeTxId = txId;
    }

    /**内链recharge奖励值 */
    get rechargeAmount() {
        return this.entity.rechargeAmount;
    }
    set rechargeAmount(amount: bigint) {
        this.entity.rechargeAmount = amount;
    }

    /**内链recharge转账事件已上链 */
    get rechargeTxOnChain() {
        return this.entity.rechargeTxOnChain;
    }
    set rechargeTxOnChain(isOnChain: boolean) {
        this.entity.rechargeTxOnChain = isOnChain;
    }

    get rechargeAssetType() {
        return this.entity.rechargeAssetType;
    }

    /**内链recharge转账事件已结束 */
    get isRechargeTxFinish() {
        return this.rechargeTxOnChain || this.retryRechargeTxNum > INTERNAL_TRANS_RETRY_MAX_NUM;
    }

    /**
     * 重试转账
     * @param assetType
     */
    async retryTransfer(assetType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE) {
        return true;
    }

    /**
     * 尝试内链转账回调
     * @param accountType
     */
    async onInternalChainTryTransferCallback(accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE): Promise<void> {
        await this.curState?.onInternalChainTryTransferCallback(this, accountType);
    }
}
