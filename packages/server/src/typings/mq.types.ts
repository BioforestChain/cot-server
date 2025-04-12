export {};
declare global {
    export namespace COTServer {
        export namespace Mq {
            /**消费订单事件数据 */
            export interface ConsumeOrderEventData extends ServerUtil.Mq.ConsumeOrderEventData {
                params?: {
                    accountType?: import("@cot/core").INTERNAL_CHAIN_RW_ACCOUNT_TYPE;
                };
            }
        }
    }
}
