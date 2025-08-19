import type { INTERNAL_CHAIN_RW_ACCOUNT_TYPE, RECHARGE_ORDER_STATE_ID } from "@bnqkl/cot-core";

export {};
declare global {
    export namespace COTServer {
        export namespace Recharge {
            /**充值交易详情 */
            export interface TransDetail {
                /**发起方交易详情 */
                fromDetail: WalletTypings.ExternalChain.TransDetail;
                /**接收方交易详情  */
                toDetail: COTCore.Recharge.ToTrInfo;
                /**发起方货币类型 */
                fromAssetSymbol: string;
                /**发起方资产精度 */
                fromDecimals: number;
                /**最终接收方获得货币数 */
                toAmount: bigint;
            }

            /**充值订单的逻辑对象 */
            export interface OrderObj extends WalletServerSdk.Order.OrderObj<RECHARGE_ORDER_STATE_ID> {
                /**
                 * 尝试内链转账回调
                 * @param accountType
                 */
                onInternalChainTryTransferCallback(accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE): Promise<void>;
            }

            /**充值订单状态 */
            export interface OrderState extends WalletServerSdk.Order.OrderState<RECHARGE_ORDER_STATE_ID> {
                /**
                 * 尝试内链转账回调
                 * @param orderObj
                 * @param accountType
                 */
                onInternalChainTryTransferCallback(orderObj: OrderObj, accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE): Promise<void>;
            }
        }
    }
}
