import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cotcore";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { ORDER_QUEUE_ROUTING_KEY } from "../../../../../common";
import { RechargeOrderObj } from "../../recharge-order-obj";
import { RechargeOrderFinallyState } from "../recharge-order-finally.state";
import { businessPublisher } from "../../../../mq";

/**成功状态 */
@Injectable()
export class Success_RechargeOrderState extends RechargeOrderFinallyState {
    constructor() {
        super(RECHARGE_ORDER_STATE_ID.SUCCESS);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RechargeOrderObj): Promise<void> {
        const { orderType, orderId, rechargeAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 充值成功！${rechargeAmount}。`);
        await businessPublisher.publishOrderEvent(ORDER_QUEUE_ROUTING_KEY.RECHARGE_ORDER_SUCCESS, { orderId });
    }
}
