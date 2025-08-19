import type { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cot-core";
import type { RechargeOrderObj } from "../recharge-order-obj.js";
import { RechargeOrderState } from "./recharge-order.state.js";

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
