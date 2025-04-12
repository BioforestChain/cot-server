import { RECHARGE_ORDER_STATE_ID } from "@cot/core";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { RechargeOrderObj } from "../../recharge-order-obj";
import { RechargeOrderFinallyState } from "../recharge-order-finally.state";

/**外链上链失败状态 */
@Injectable()
export class ExternalOnChainFail_RechargeOrderState extends RechargeOrderFinallyState {
    constructor() {
        super(RECHARGE_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RechargeOrderObj): Promise<void> {
        const { orderType, orderId, rechargeAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 外链转账失败。rechargeAmount:${rechargeAmount}`);
    }
}
