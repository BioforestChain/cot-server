import { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { Injectable } from "@nestjs/common";
import { walletServerSdk } from "../../../../../helper";
import { RedemptionOrderObj } from "../../redemption-order-obj";
import { RedemptionOrderPendingState } from "../redemption-order-pending.state";

/**等待内链上链状态 */
@Injectable()
export class InternalWaitOnChain_RedemptionOrderState extends RedemptionOrderPendingState {
    constructor() {
        super(REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN);
    }

    /**
     * 心跳
     * @param orderObj
     */
    async onTick(orderObj: RedemptionOrderObj): Promise<void> {
        // 服务器重启时，可能wallet服务不可用，不断重试创建from交易逻辑对象
        if (!orderObj.createFromTxObjSuccess) {
            await walletServerSdk.createInternalTransObj({ chainName: orderObj.internalChain, txId: orderObj.redemptionTxId });
            orderObj.createFromTxObjSuccess = true;
        }
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        await walletServerSdk.createInternalTransObj({ chainName: orderObj.internalChain, txId: orderObj.redemptionTxId });
        orderObj.createFromTxObjSuccess = true;
    }

    /**
     * 校验交易id
     * @param orderObj
     * @param txId
     */
    private __verifyTxId(orderObj: RedemptionOrderObj, txId: string) {
        if (txId !== orderObj.redemptionTxId) {
            throw Error(`orderObj.redemptionTxId:${orderObj.redemptionTxId}`);
        }
    }

    /**
     * 内链上链成功回调
     * @param orderObj
     * @param trans
     */
    async onInternalChainSuccessCallback(orderObj: RedemptionOrderObj, trans: WalletTypings.InternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        await orderObj.changeState(REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN, this.getStateId());
    }

    /**
     * 内链上链失败回调
     * @param orderObj
     * @param trans
     */
    async onInternalChainFailCallback(orderObj: RedemptionOrderObj, trans: WalletTypings.InternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        await orderObj.changeState(REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL, this.getStateId());
    }
}
