import { ExternalAssetType, ExternalChainName, InternalAssetType, InternalChainName } from "@bnqkl/wallet-typings";

export {};
declare global {
    export namespace COTCore {
        export type DeepPartial<T> = {
            [P in keyof T]?: DeepPartial<T[P]>;
        };

        export interface BasePageData<T> {
            page: number;
            pageSize: number;
            dataList: T[];
        }

        export interface PageData<T> extends BasePageData<T> {
            total: number;
            hasMore: boolean;
            skip: number;
        }

        export interface PageDataConstructor {
            new <T>(page: number, pageSize: number, dataList: T[], total: number, hasMore: boolean, skip: number): PageData<T>;
        }

        /**按页获取结果的请求 */
        export interface PageRequest {
            /**页序号 */
            page: number;
            /**页大小 */
            pageSize: number;
        }

        export type Fraction = {
            /**分子 */
            numerator: string | number;
            /**分母*/
            denominator: string | number;
        };

        export namespace Config {
            /**外链的充值信息 */
            export type ExternalAssetInfoItem = {
                /**兑换是否开启 */
                enable: boolean;
                /**合约 */
                contract?: string;
                /**充值地址 */
                depositAddress: string;
                /**资产名 显示用 */
                assetType: string;
                logo?: string;
            };

            export type RechargeItem = {
                /**充值开启 */
                enable: boolean;
                /**支持的链 */
                chainName: InternalChainName;
                /**充值的代币名称 */
                assetType: InternalAssetType;
                /**内链币的发行地址 */
                applyAddress: string;
                /**外链充值支持 */
                supportChain: {
                    ETH?: ExternalAssetInfoItem;
                    BSC?: ExternalAssetInfoItem;
                    TRON?: ExternalAssetInfoItem;
                };
                /**赎回 */
                redemption: {
                    enable: boolean;
                    /**单笔赎回上下限 */
                    min: bigint;
                    max: bigint;
                    /**
                     * 赎回扣取的手续费. 单位为本， 为生物链林单位
                     * 因为各个代币的合约精度不一样。这里以链去扣取相应的手续费。
                     * 如果eth配置了10，那么手续费就是10个usdt 或10个usdc 取决于赎回哪一个币种
                     */
                    fee: {
                        [chainName: string]: string;
                    };
                    /**扣除的手续费比例 */
                    radioFee: string;
                };
                logo?: string;
            };
            export type RechargeObject = {
                [chainName: string]: {
                    [assetType: string]: RechargeItem;
                };
            };
            export type BusinessConfig = {
                /**充值 */
                recharge: RechargeObject;
            };
        }
    }
}
