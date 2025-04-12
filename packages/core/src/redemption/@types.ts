import { ExternalAssetType, ExternalChainName, InternalChainName } from "@bnqkl/wallet-typings";
import { REDEMPTION_ORDER_STATE_ID, REDEMPTION_RECORD_STATE } from "./constants";

export {};
declare global {
    export namespace COTCore {
        export namespace Redemption {
            /**为了方便客户端，Api命名空间下只包含各Dto的接口和注释，相当于对接文档 */
            export namespace Api {
                /**
                 * 赎回订单重试内链上链
                 * POST /cot/redemption/retryInternalOnChain
                 */
                export interface RedemptionRetryInternalOnChainReqDto {
                    /**订单id */
                    orderId: string;
                }
                export type RedemptionRetryInternalOnChainResDto = boolean;

                /**
                 * 赎回订单重试外链上链
                 * POST /cot/redemption/retryExternalOnChain
                 */
                export interface RedemptionRetryExternalOnChainReqDto {
                    /**订单id */
                    orderId: string;
                }
                export type RedemptionRetryExternalOnChainResDto = boolean;

                /**
                 * 获取赎回记录列表
                 * GET /cot/redemption/records
                 */
                export interface RedemptionRecordsReqDto extends PageRequest {
                    /**内链名 */
                    internalChain?: InternalChainName;
                    /**内链发起地址 */
                    internalAddress?: string;
                }
                export type RedemptionRecordsResDto = BasePageData<RedemptionRecord>;

                /**
                 * 获取赎回记录详情
                 * GET /cot/redemption/recordDetail
                 */
                export interface RedemptionRecordDetailReqDto {
                    /**订单id */
                    orderId: string;
                }
                export interface RedemptionRecordDetailResDto extends WalletTypings.Order.RecordDetail<REDEMPTION_RECORD_STATE, REDEMPTION_ORDER_STATE_ID> {
                    /**发起方交易信息 */
                    fromTxInfo: WalletTypings.Order.RecordDetailTxInfo;
                    /**接收方交易信息 */
                    toTxInfo: WalletTypings.Order.RecordDetailTxInfo;
                    /**赎回比例T */
                    redemptionRatio: number;
                }

                /**
                 * 赎回
                 * POST /cot/redemption/V2
                 */
                export interface RedemptionV2ReqDto {
                    /**发起方交易体 */
                    fromTrJson: RedemptionV2Tr;
                }
                export interface RedemptionV2ResDto {
                    /**赎回订单id */
                    orderId: string;
                }
            }

            /**赎回交易体remark */
            export type TransRemark = WalletTypings.ExternalChain.ToTrInfo;

            /**赎回记录 */
            export interface RedemptionRecord extends WalletTypings.Order.Record<REDEMPTION_RECORD_STATE, REDEMPTION_ORDER_STATE_ID> {
                /**发起方交易信息 */
                fromTxInfo: WalletTypings.Order.RecordTxInfo;
                /**接收方交易信息 */
                toTxInfo: WalletTypings.Order.RecordTxInfo;
                /**赎回手续费 */
                redemptionFee: string;
            }

            /**赎回币种信息 */
            export interface AssetTypeInfo {
                /**币种 */
                assetType: ExternalAssetType;
                /**余额 */
                balance: string;
                /**精度 */
                decimals: number;
                /**图标 */
                icon: string;
                /**合约号 */
                contractAddress: string;
            }

            export type RedemptionV2Tr = WalletTypings.InternalChain.FromTrJsonCommon<WalletTypings.InternalChain.DestroyAssetAsset, { recipientId: string }>;
        }
    }
}
