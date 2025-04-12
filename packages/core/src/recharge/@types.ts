import { RECHARGE_ORDER_STATE_ID, RECHARGE_RECORD_STATE } from "./constants";
import type {} from "../external-chain";
import { ExternalAssetType, ExternalChainName, InternalAssetType, InternalChainName } from "@bnqkl/wallet-typings";
export {};
declare global {
    export namespace COTCore {
        export namespace Recharge {
            /**为了方便客户端，Api命名空间下只包含各Dto的接口和注释，相当于对接文档 */
            export namespace Api {
                /**
                 * 充值订单重试外链上链
                 * POST /cot/recharge/retryExternalOnChain
                 */
                export interface RechargeRetryExternalOnChainReqDto {
                    /**订单id */
                    orderId: string;
                }
                export type RechargeRetryExternalOnChainResDto = boolean;

                /**
                 * 充值订单重试内链上链
                 * POST /cot/recharge/retryInternalOnChain
                 */
                export interface RechargeRetryInternalOnChainReqDto {
                    /**订单id */
                    orderId: string;
                }
                export type RechargeRetryInternalOnChainResDto = boolean;

                /**
                 * 获取充值记录列表
                 * GET /cot/recharge/records
                 */
                export interface RechargeRecordsReqDto extends PageRequest {
                    /**内链名 */
                    internalChain?: InternalChainName;
                    /**内链发起地址 */
                    internalAddress?: string;
                    /**充值记录状态 */
                    recordState?: RECHARGE_RECORD_STATE;
                }
                export type RechargeRecordsResDto = BasePageData<RechargeRecord>;

                /**
                 * 获取充值记录详情
                 * GET /cot/recharge/recordDetail
                 */
                export interface RechargeRecordDetailReqDto {
                    /**订单id */
                    orderId: string;
                }
                export interface RechargeRecordDetailResDto extends WalletTypings.Order.RecordDetail<RECHARGE_RECORD_STATE, RECHARGE_ORDER_STATE_ID> {
                    /**发起方交易信息 */
                    fromTxInfo: WalletTypings.Order.RecordDetailTxInfo;
                    /**接收方交易信息 */
                    toTxInfos: {
                        [assetType: string]: WalletTypings.Order.RecordDetailTxInfo;
                    };
                }

                /**
                 * 获取合约池信息
                 * GET /cot/recharge/contractPoolInfo
                 */
                export interface RechargeContractPoolReqDto {
                    /**内链名 */
                    internalChainName: InternalChainName;
                }

                export type ExternalChainInfo = {
                    chainName: ExternalChainName;
                    assetType: ExternalAssetType;
                };
                export type RechargeContractPoolItem = {
                    /**内链名 */
                    chainName: InternalChainName;
                    /**内链资产名 */
                    assetType: InternalAssetType;
                    /**支持的外链 */
                    externalChainInfo: ExternalChainInfo[];
                    /**总铸造量 */
                    totalMinted: string;
                    /**当前流通总量 */
                    totalCirculation: string;
                    /**总销毁量 */
                    totalBurned: string;
                    /**总质押量 */
                    totalStaked: string;
                };
                export interface RechargeContractPoolResDto {
                    poolInfo: RechargeContractPoolItem[];
                }

                /**
                 * 获取当前充值允许的代币
                 * GET /cot/recharge/support
                 */
                export interface RechageSupportResDto extends COTCore.Config.BusinessConfig {}

                /**
                 * 充值
                 * POST /cot/recharge/V2
                 */
                export interface RechargeV2ReqDto {
                    /**发起方交易体 */
                    fromTrJson: WalletTypings.ExternalChain.FromTrJson;
                    /**投入权益参数 */
                    message: RechargeV2ToTrInfoData;
                    /**验签信息 */
                    signatureInfo: COTCore.Verify.SignatureInfo;
                }
                export interface RechargeResDto {
                    /**充值订单id */
                    orderId: string;
                }
            }

            /**接收方交易信息 */
            // export type ToTrInfo = Omit<WalletTypings.InternalChain.ToTrInfo, "assetType">;
            export type ToTrInfo = WalletTypings.InternalChain.ToTrInfo;

            /**充值记录 */
            export interface RechargeRecord extends WalletTypings.Order.Record<RECHARGE_RECORD_STATE, RECHARGE_ORDER_STATE_ID> {
                /**发起方交易信息 */
                fromTxInfo: WalletTypings.Order.RecordTxInfo;
                /**接收方交易信息 */
                toTxInfoArray: WalletTypings.Order.RecordTxInfo[];
            }

            export interface RechargeV2ToTrInfoData extends ToTrInfo {
                /**地址 */
                address: string;
                /**时间戳 */
                timestamp: number;
            }
        }
    }
}
