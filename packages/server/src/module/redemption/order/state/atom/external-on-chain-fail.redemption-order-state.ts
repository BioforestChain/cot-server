import { REDEMPTION_ORDER_STATE_ID } from "@cot/core";
import { Injectable } from "@nestjs/common";
import { Logger } from "@bnqkl/wallet-sdk";
import { RedemptionOrderObj } from "../../redemption-order-obj";
import { RedemptionOrderFinallyState } from "../redemption-order-finally.state";

/**外链上链失败状态 */
@Injectable()
export class ExternalOnChainFail_RedemptionOrderState extends RedemptionOrderFinallyState {
    constructor() {
        super(REDEMPTION_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL);
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        const { orderType, orderId, walletAsset, walletAmount } = orderObj;
        Logger.debug(`<${orderType}> orderId:${orderId} 外链转账失败。${walletAsset}:${walletAmount}`);
    }
}
