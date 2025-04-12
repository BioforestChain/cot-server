import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {
    Success_RechargeOrderState,
    InternalOnChainFail_RechargeOrderState,
    InternalWaitOnChain_RechargeOrderState,
    ExternalWaitOnChain_RechargeOrderState,
    ExternalOnChainFail_RechargeOrderState,
    RechargeOrderState,
} from "./state";
import { RechargeOrderObj } from "./recharge-order-obj";
import { RechargeOrderRepository } from "../recharge.repository";
import { FindOptionsWhere, In } from "typeorm";
import { RECHARGE_ORDER_STATE_ID, RECHARGE_TYPE } from "@cot/core";
import { ORDER_TYPE, ORDER_QUEUE_ROUTING_KEY, ORDER_TEMP_QUEUE_ROUTING_KEY, RechargeOrder } from "../../../common";
import { ChainHelper, CommonHelper, InternalAssetType, InternalMainAssetType, Logger, OrderMgr } from "@bnqkl/wallet-sdk";
import { GlobalValueRedisRepository } from "../../redis/global-value.redis-repository";
import { businessConsumer, businessPublisher } from "../../mq";

/**充值订单管理器 */
@Injectable()
export class RechargeOrderMgr extends OrderMgr<RECHARGE_ORDER_STATE_ID, RechargeOrderState, RechargeOrder, RechargeOrderObj, ORDER_TYPE> {
    @Inject(forwardRef(() => RechargeOrderRepository))
    public readonly repository: RechargeOrderRepository;
    @Inject(forwardRef(() => ExternalWaitOnChain_RechargeOrderState))
    private __externalWaitOnChain_RechargeOrderState!: ExternalWaitOnChain_RechargeOrderState;
    @Inject(forwardRef(() => ExternalOnChainFail_RechargeOrderState))
    private __externalOnChainFail_RechargeOrderState!: ExternalOnChainFail_RechargeOrderState;
    @Inject(forwardRef(() => InternalWaitOnChain_RechargeOrderState))
    private __internalWaitOnChain_RechargeOrderState!: InternalWaitOnChain_RechargeOrderState;
    @Inject(forwardRef(() => InternalOnChainFail_RechargeOrderState))
    private __internalOnChainFail_RechargeOrderState!: InternalOnChainFail_RechargeOrderState;
    @Inject(forwardRef(() => Success_RechargeOrderState))
    private __success_RechargeOrderState!: Success_RechargeOrderState;
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    constructor() {
        super(ORDER_TYPE.RECHARGE);
    }

    /**
     * 获取待处理订单的条件
     */
    getPendingOrderOptions(): FindOptionsWhere<RechargeOrder> {
        return { state: In([RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN, RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN]) };
    }

    /**
     * 获取初始化订单的条件
     */
    getInitOrderOptions(): FindOptionsWhere<RechargeOrder> {
        return { state: RECHARGE_ORDER_STATE_ID.INIT };
    }

    /**
     * 设置订单为待处理
     * @param order
     */
    setOrderPending(order: RechargeOrder): void {
        switch (order.rechargeType) {
            case RECHARGE_TYPE.ISSUE:
                order.state = RECHARGE_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN;
                break;
            case RECHARGE_TYPE.AIRDROP:
                order.state = RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN;
                break;
            default:
                break;
        }
    }

    newOrderObj(order: RechargeOrder): RechargeOrderObj {
        return new RechargeOrderObj(order, this, this.repository);
    }

    /**
     * 初始化
     */
    async init(): Promise<void> {
        // 注册state
        this.registerState(this.__externalWaitOnChain_RechargeOrderState);
        this.registerState(this.__externalOnChainFail_RechargeOrderState);
        this.registerState(this.__internalWaitOnChain_RechargeOrderState);
        this.registerState(this.__internalOnChainFail_RechargeOrderState);
        this.registerState(this.__success_RechargeOrderState);
        // 加载订单
        await this.loadOrder();
        this.tick();
    }

    /**
     * 处理mq连接事件
     */
    async processMqConnect() {
        // 处理充值订单临时队列
        this.__processOrderTempQueue();
    }

    /**
     * 处理mq重连事件
     */
    async processMqReConnect() {
        for (const { curStateId, orderId } of this.__processingOrderObjMap.values()) {
            if (curStateId === RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN) {
                await businessPublisher.publishOrderEvent(ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TO_TX_START, { orderId }, true);
            }
        }
    }

    /**
     * 处理充值订单临时队列
     */
    private __processOrderTempQueue(): void {
        // 充值订单开始接收方上链
        businessConsumer.consumeOrderEvent(
            ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TO_TX_START,
            async ({ orderId }) => {
                const orderObj = this.__getProcessingOrder(orderId);
                if (!orderObj) {
                    // 内存中找不到订单，只打印错误，不重试
                    Logger.warn(`couldn't found orderObj:${orderId} is Processing in ${ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TO_TX_START}`);
                    return;
                }
                await orderObj.onToTxStartCallback();
            },
            true,
        );
        // 充值订单尝试内链转账
        businessConsumer.consumeOrderEvent(
            ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TRY_TRANSFER,
            async ({ orderId, params }) => {
                const orderObj = this.__getProcessingOrder(orderId);
                if (!orderObj) {
                    // 内存中找不到订单，只打印错误，不重试
                    Logger.warn(`couldn't found orderObj:${orderId} is Processing in ${ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TRY_TRANSFER}`);
                    return;
                }
                if (!params || !params.accountType) {
                    Logger.warn(`accountType is undefined`);
                    return;
                }
                await orderObj.onInternalChainTryTransferCallback(params.accountType);
            },
            true,
            { expiration: 0 },
        );
    }

    /**
     * 处理订单完成逻辑
     */
    processOrderDone(): void {
        // 处理充值订单成功
        const routingKey = ORDER_QUEUE_ROUTING_KEY.RECHARGE_ORDER_SUCCESS;
        businessConsumer.consumeOrderEvent(
            routingKey,
            async (args) => {
                const { orderId } = args;
                if (await this.__globalValueRedisRepository.isConsumeComplete(routingKey, args)) {
                    // 已经消费过，直接返回
                    Logger.warn(`consume repeat ${routingKey}. orderId:${orderId}`);
                    return;
                }
                await this.__globalValueRedisRepository.setConsumeComplete(routingKey, args);
                Logger.debug(`充值订单: ${orderId} 处理成功完成！`);
            },
            undefined,
            undefined,
            async (args) => {
                await this.__globalValueRedisRepository.delConsumeComplete(routingKey, args);
            },
        );
    }
}
