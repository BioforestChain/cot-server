import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Logger, OrderMgr } from "@bnqkl/wallet-sdk";
import {
    Success_RedemptionOrderState,
    InternalOnChainFail_RedemptionOrderState,
    InternalWaitOnChain_RedemptionOrderState,
    ExternalWaitOnChain_RedemptionOrderState,
    ExternalOnChainFail_RedemptionOrderState,
    RedemptionOrderState,
} from "./state";
import { RedemptionOrderObj } from "./redemption-order-obj";
import { ORDER_QUEUE_ROUTING_KEY, ORDER_TEMP_QUEUE_ROUTING_KEY, ORDER_TYPE, RedemptionOrder } from "../../../common";
import { RedemptionOrderRepository } from "../redemption.repository";
import { FindOptionsWhere, In } from "typeorm";
import { REDEMPTION_ORDER_STATE_ID } from "@cot/core";
import { businessConsumer, businessPublisher } from "../../mq";

/**赎回订单管理器 */
@Injectable()
export class RedemptionOrderMgr extends OrderMgr<REDEMPTION_ORDER_STATE_ID, RedemptionOrderState, RedemptionOrder, RedemptionOrderObj, ORDER_TYPE> {
    @Inject(forwardRef(() => RedemptionOrderRepository))
    public readonly repository: RedemptionOrderRepository;
    @Inject(forwardRef(() => ExternalWaitOnChain_RedemptionOrderState))
    private __externalWaitOnChain_RedemptionOrderState!: ExternalWaitOnChain_RedemptionOrderState;
    @Inject(forwardRef(() => ExternalOnChainFail_RedemptionOrderState))
    private __externalOnChainFail_RedemptionOrderState!: ExternalOnChainFail_RedemptionOrderState;
    @Inject(forwardRef(() => InternalWaitOnChain_RedemptionOrderState))
    private __internalWaitOnChain_RedemptionOrderState!: InternalWaitOnChain_RedemptionOrderState;
    @Inject(forwardRef(() => InternalOnChainFail_RedemptionOrderState))
    private __internalOnChainFail_RedemptionOrderState!: InternalOnChainFail_RedemptionOrderState;
    @Inject(forwardRef(() => Success_RedemptionOrderState))
    private __success_RedemptionOrderState!: Success_RedemptionOrderState;

    constructor() {
        super(ORDER_TYPE.REDEMPTION);
    }

    /**
     * 获取待处理订单的条件
     */
    getPendingOrderOptions(): FindOptionsWhere<RedemptionOrder> {
        return { state: In([REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN, REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN]) };
    }

    /**
     * 获取初始化订单的条件
     */
    getInitOrderOptions(): FindOptionsWhere<RedemptionOrder> {
        return { state: REDEMPTION_ORDER_STATE_ID.INIT };
    }

    /**
     * 设置订单为待处理
     * @param order
     */
    setOrderPending(order: RedemptionOrder): void {
        order.state = REDEMPTION_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN;
    }

    newOrderObj(order: RedemptionOrder): RedemptionOrderObj {
        return new RedemptionOrderObj(order, this, this.repository);
    }

    /**
     * 初始化
     */
    async init(): Promise<void> {
        // 注册
        this.registerState(this.__externalWaitOnChain_RedemptionOrderState);
        this.registerState(this.__externalOnChainFail_RedemptionOrderState);
        this.registerState(this.__internalWaitOnChain_RedemptionOrderState);
        this.registerState(this.__internalOnChainFail_RedemptionOrderState);
        this.registerState(this.__success_RedemptionOrderState);
        // 加载订单
        await this.loadOrder();
        this.tick();
    }

    /**
     * 处理mq连接事件
     */
    async processMqConnect() {
        // 处理赎回订单临时队列
        this.__processOrderTempQueue();
    }

    /**
     * 处理mq重连事件
     */
    async processMqReConnect() {
        for (const { curStateId, orderId } of this.__processingOrderObjMap.values()) {
            if (curStateId === REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN) {
                await businessPublisher.publishOrderEvent(ORDER_TEMP_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_TO_TX_START, { orderId }, true);
            }
        }
    }

    /**
     * 处理赎回订单临时队列
     */
    private __processOrderTempQueue(): void {
        // 赎回订单开始接收方上链
        businessConsumer.consumeOrderEvent(
            ORDER_TEMP_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_TO_TX_START,
            async ({ orderId }) => {
                const orderObj = this.__getProcessingOrder(orderId);
                if (!orderObj) {
                    // 内存中找不到订单，只打印错误，不重试
                    Logger.warn(`couldn't found orderObj:${orderId} is Processing in ${ORDER_TEMP_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_TO_TX_START}`);
                    return;
                }
                await orderObj.onToTxStartCallback();
            },
            true,
            { expiration: 0 },
        );
    }

    /**
     * 处理订单完成逻辑
     */
    processOrderDone(): void {
        // 处理赎回订单成功
        businessConsumer.consumeOrderEvent(ORDER_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_SUCCESS, async ({ orderId }) => {
            Logger.debug(`赎回订单: ${orderId} 处理成功完成！`);
        });
    }
}
