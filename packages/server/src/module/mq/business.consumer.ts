import { MqConsumer } from "@bnqkl/wallet-sdk";
import type { ORDER_QUEUE_ROUTING_KEY, ORDER_TEMP_QUEUE_ROUTING_KEY } from "../../common/index.js";
import { LOCAL_MQ_ID, ORDER_EXCHANGE_NAME } from "../../common/index.js";

export class BusinessConsumer extends MqConsumer {
    /**
     * 消费订单事件
     * @param routingKey
     * @param onConsumeNormalCallback 消费普通队列的回调函数
     * @param bTemp
     * @param dlxOpts 死信队列选项
     * @param afterAckNormalCallback 确认消费普通队列之后的回调函数
     */
    async consumeOrderEvent(
        routingKey: ORDER_QUEUE_ROUTING_KEY | ORDER_TEMP_QUEUE_ROUTING_KEY,
        onConsumeNormalCallback: (args: COTServer.Mq.ConsumeOrderEventData) => Promise<void>,
        bTemp = false,
        dlxOpts?: {
            expiration?: number;
            onConsumeDLXCallback?: (args: COTServer.Mq.ConsumeOrderEventData) => Promise<void>;
        },
        afterAckNormalCallback?: (args: COTServer.Mq.ConsumeOrderEventData) => Promise<void>,
    ) {
        return await this.consumeEvent(
            ORDER_EXCHANGE_NAME.ORDER,
            ORDER_EXCHANGE_NAME.ORDER_DEAD_LETTER,
            routingKey,
            onConsumeNormalCallback,
            LOCAL_MQ_ID,
            bTemp,
            dlxOpts,
            afterAckNormalCallback,
        );
    }
}
