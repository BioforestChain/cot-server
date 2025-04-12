import { REDEMPTION_ORDER_STATE_ID } from "@cot/core";
import { forwardRef, Inject } from "@nestjs/common";
import { Logger, OrderState } from "@bnqkl/wallet-sdk";
import { RedemptionService } from "../../redemption.service";

/**赎回订单状态基类 */
export abstract class RedemptionOrderState extends OrderState<REDEMPTION_ORDER_STATE_ID> implements COTServer.Redemption.OrderState {
    @Inject(forwardRef(() => RedemptionService))
    protected __redemptionService!: RedemptionService;

    constructor(stateId: REDEMPTION_ORDER_STATE_ID) {
        super(stateId);
    }

    getStateName() {
        return REDEMPTION_ORDER_STATE_ID[this.getStateId()];
    }
}
