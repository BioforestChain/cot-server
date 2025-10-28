import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { RechargeOrderObj } from "../recharge-order-obj";
import { RechargeOrderState } from "./recharge-order.state";

/**充值订单最终状态 */
export abstract class RechargeOrderFinallyState extends RechargeOrderState {
    constructor(stateId: RECHARGE_ORDER_STATE_ID) {
        super(stateId);
    }

    /**
     * 进入状态后置逻辑
     * @param orderObj
     */
    async afterEnterState(orderObj: RechargeOrderObj): Promise<void> {
        // 关闭订单
        await orderObj.close();
    }
}
