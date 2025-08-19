import type { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cot-core";
import type { RedemptionOrderObj } from "../redemption-order-obj.js";
import { RedemptionOrderState } from "./redemption-order.state.js";

/**赎回订单最终状态 */
export abstract class RedemptionOrderFinallyState extends RedemptionOrderState {
    constructor(stateId: REDEMPTION_ORDER_STATE_ID) {
        super(stateId);
    }

    /**
     * 进入状态后置逻辑
     * @param orderObj
     */
    async afterEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        // 关闭订单
        await orderObj.close();
    }
}
