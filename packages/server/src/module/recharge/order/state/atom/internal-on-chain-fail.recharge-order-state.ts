import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cot-core";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import type { RechargeOrderObj } from "../../recharge-order-obj.js";
import { RechargeOrderFinallyState } from "../recharge-order-finally.state.js";

/**内链上链失败状态 */
@Injectable()
export class InternalOnChainFail_RechargeOrderState extends RechargeOrderFinallyState {
    constructor() {
        super(RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RechargeOrderObj): Promise<void> {
        const { orderType, orderId, rechargeAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 内链转账失败。${rechargeAmount}。`);
    }
}
