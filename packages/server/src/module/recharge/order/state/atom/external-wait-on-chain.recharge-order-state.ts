import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { RechargeHelper, walletServerSdk } from "../../../../../helper";
import { RechargeOrderObj } from "../../recharge-order-obj";
import { RechargeOrderPendingState } from "../recharge-order-pending.state";

/**等待外链上链状态 */
@Injectable()
export class ExternalWaitOnChain_RechargeOrderState extends RechargeOrderPendingState {
    constructor() {
        super(RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN);
    }

    /**
     * 心跳
     * @param orderObj
     */
    async onTick(orderObj: RechargeOrderObj): Promise<void> {
        // 服务器重启时，可能wallet服务不可用，不断重试创建from交易逻辑对象
        if (!orderObj.createFromTxObjSuccess) {
            await walletServerSdk.createExternalTransObj({ chainName: orderObj.walletChain, txId: orderObj.walletTxId });
            orderObj.createFromTxObjSuccess = true;
        }
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RechargeOrderObj): Promise<void> {
        if (await RechargeHelper.isRechargeDevTest()) {
            // 充值开发测试时，外链直接成功
            Logger.debug(`<${orderObj.orderType}> orderId:${orderObj.orderId} 外链事件跳过，上链成功`);
            await orderObj.changeState(RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN, this.getStateId());
            return;
        }
        await walletServerSdk.createExternalTransObj({ chainName: orderObj.walletChain, txId: orderObj.walletTxId });
        orderObj.createFromTxObjSuccess = true;
    }

    /**
     * 校验交易hash
     * @param orderObj
     * @param txId
     */
    private __verifyTxId(orderObj: RechargeOrderObj, txId: string) {
        if (txId !== orderObj.walletTxId) {
            throw Error(`txId:${txId} !== orderObj.txHash:${orderObj.walletTxId}`);
        }
    }

    /**
     * 外链上链成功回调
     * @param orderObj
     * @param trans
     */
    async onExternalChainSuccessCallback(orderObj: RechargeOrderObj, trans: WalletTypings.ExternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        await orderObj.changeState(RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN, this.getStateId());
    }

    /**
     * 外链上链失败回调
     * @param orderObj
     * @param trans
     */
    async onExternalChainFailCallback(orderObj: RechargeOrderObj, trans: WalletTypings.ExternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        await orderObj.changeState(RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL, this.getStateId());
    }
}
