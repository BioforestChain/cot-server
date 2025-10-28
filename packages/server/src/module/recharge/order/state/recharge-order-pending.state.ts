import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { RechargeOrderObj } from "../recharge-order-obj";
import { RechargeOrderState } from "./recharge-order.state";

/**充值订单待处理状态 */
export abstract class RechargeOrderPendingState extends RechargeOrderState {
    constructor(stateId: RECHARGE_ORDER_STATE_ID) {
        super(stateId);
    }

    /**
     * 进入状态前置逻辑
     * @param orderObj
     */
    async beforeEnterState(orderObj: RechargeOrderObj): Promise<void> {
        // 保存state
        await orderObj.saveState();
    }
}
