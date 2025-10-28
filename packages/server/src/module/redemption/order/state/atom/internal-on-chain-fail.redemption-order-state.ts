import { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { RedemptionOrderObj } from "../../redemption-order-obj";
import { RedemptionOrderFinallyState } from "../redemption-order-finally.state";

/**内链上链失败状态 */
@Injectable()
export class InternalOnChainFail_RedemptionOrderState extends RedemptionOrderFinallyState {
    constructor() {
        super(REDEMPTION_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        const { orderType, orderId, redemptionAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 内链转账失败。${redemptionAmount}`);
    }
}
