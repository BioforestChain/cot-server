import type { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cot-core";
import type { RedemptionOrderObj } from "../redemption-order-obj.js";
import { RedemptionOrderState } from "./redemption-order.state.js";

/**赎回订单待处理状态 */
export abstract class RedemptionOrderPendingState extends RedemptionOrderState {
    constructor(stateId: REDEMPTION_ORDER_STATE_ID) {
        super(stateId);
    }

    /**
     * 进入状态前置逻辑
     * @param orderObj
     */
    async beforeEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        // 保存state
        await orderObj.saveState();
    }
}
