import { staticConfig } from "../../config";

export const LOCAL_MQ_ID = staticConfig.mysql.dbName;

/**交换机名字 */
export enum ORDER_EXCHANGE_NAME {
    /**订单事件普通交换机 */
    ORDER = "order_exchange",
    /**订单事件死信交换机 */
    ORDER_DEAD_LETTER = "order_deadLetter_exchange",
}

/**消息队列的路由key */
export enum ORDER_QUEUE_ROUTING_KEY {
    /**充值订单成功 */
    RECHARGE_ORDER_SUCCESS = "rechargeOrderSuccess",
    /**赎回订单成功 */
    REDEMPTION_ORDER_SUCCESS = "redemptionOrderSuccess",
}

/**临时消息队列的路由key */
export enum ORDER_TEMP_QUEUE_ROUTING_KEY {
    /**充值订单开始接收方上链 */
    RECHARGE_ORDER_TO_TX_START = "rechargeOrderToTxStart",
    /**充值订单尝试内链转账 */
    RECHARGE_ORDER_TRY_TRANSFER = "rechargeOrderTryTransfer",
    /**赎回订单开始接收方上链 */
    REDEMPTION_ORDER_TO_TX_START = "redemptionOrderToTxStart",
}
