import { MqPublisher } from "@bnqkl/wallet-sdk";
import { LOCAL_MQ_ID, ORDER_EXCHANGE_NAME, ORDER_QUEUE_ROUTING_KEY, ORDER_TEMP_QUEUE_ROUTING_KEY } from "../../common";

export class BusinessPublisher extends MqPublisher {
    /**
     * 生产订单事件
     * @param routingKey
     * @param data
     * @param bTemp
     * @param timeOffset
     * @returns
     */
    async publishOrderEvent(
        routingKey: ORDER_QUEUE_ROUTING_KEY | ORDER_TEMP_QUEUE_ROUTING_KEY,
        data: COTServer.Mq.ConsumeOrderEventData,
        bTemp = false,
        timeOffset?: number,
    ) {
        return await this.publishEvent(ORDER_EXCHANGE_NAME.ORDER, ORDER_EXCHANGE_NAME.ORDER_DEAD_LETTER, routingKey, data, LOCAL_MQ_ID, bTemp, timeOffset);
    }
}
