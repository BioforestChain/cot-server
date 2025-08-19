import type { REDEMPTION_ORDER_STATE_ID } from "@bnqkl/cot-core";

export {};
declare global {
    export namespace COTServer {
        export namespace Redemption {
            /**赎回交易详情 */
            export interface TransDetail {
                /**发起方交易详情 */
                fromDetail: WalletTypings.InternalChain.TransDetail;
                /**接收方交易详情  */
                toDetail: WalletTypings.ExternalChain.ToTrDetail;
                /**最终接收方获得货币数 */
                toAmount: bigint;
                /**赎回比例 */
                redemptionRatio: COTCore.Fraction;
                /**赎回手续费 */
                redemptionFee: bigint;
            }

            /**赎回订单的逻辑对象 */
            export interface OrderObj extends WalletServerSdk.Order.OrderObj<REDEMPTION_ORDER_STATE_ID> {}

            /**赎回订单状态 */
            export interface OrderState extends WalletServerSdk.Order.OrderState<REDEMPTION_ORDER_STATE_ID> {}
        }
    }
}
