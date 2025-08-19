import { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cot-core";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { ORDER_QUEUE_ROUTING_KEY } from "../../../../../common/index.js";
import type { RedemptionOrderObj } from "../../redemption-order-obj.js";
import { RedemptionOrderFinallyState } from "../redemption-order-finally.state.js";
import { businessPublisher } from "../../../../mq/index.js";

/**成功状态 */
@Injectable()
export class Success_RedemptionOrderState extends RedemptionOrderFinallyState {
    constructor() {
        super(REDEMPTION_ORDER_STATE_ID.SUCCESS);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        const { orderType, orderId, redemptionAmount, walletAsset, walletAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 赎回:${redemptionAmount}成功！ 获得${walletAsset}:${walletAmount}本。`);
        await businessPublisher.publishOrderEvent(ORDER_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_SUCCESS, { orderId });
    }
}
