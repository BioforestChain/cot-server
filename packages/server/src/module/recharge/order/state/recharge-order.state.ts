import type { INTERNAL_CHAIN_RW_ACCOUNT_TYPE} from "@bnqkl/cot-core";
import { RECHARGE_ORDER_STATE_ID } from "@bnqkl/cot-core";
import { forwardRef, Inject } from "@nestjs/common";
import { Logger, OrderState } from "@bnqkl/wallet-sdk";
import { RechargeService } from "../../recharge.service.js";
import type { RechargeOrderObj } from "../recharge-order-obj.js";

/**充值订单状态基类 */
export abstract class RechargeOrderState extends OrderState<RECHARGE_ORDER_STATE_ID> implements COTServer.Recharge.OrderState {
    @Inject(forwardRef(() => RechargeService))
    protected __rechargeService!: RechargeService;

    constructor(stateId: RECHARGE_ORDER_STATE_ID) {
        super(stateId);
    }

    getStateName() {
        return RECHARGE_ORDER_STATE_ID[this.getStateId()];
    }

    /**
     * 尝试内链转账回调
     * @param orderObj
     * @param accountType
     */
    async onInternalChainTryTransferCallback(orderObj: RechargeOrderObj, accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE): Promise<void> {
        Logger.warn(`<${orderObj.orderType}> orderId:${orderObj.orderId} can't onInternalChainTryTransferCallback in state:${this.getStateName()}`);
    }
}
