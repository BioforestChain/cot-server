import { FIX_RECHARGE_ORDER_TYPE, FIX_REDEMPTION_ORDER_TYPE } from "./constants.js";
import { RECHARGE_ORDER_STATE_ID } from "../recharge/index.js";
import { REDEMPTION_ORDER_STATE_ID } from "../redemption/index.js";

export {};
declare global {
    export namespace COTCore {
        export namespace Api {
            export namespace Admin {
                export namespace User {
                    /**用户登录请求对象 */
                    export type LoginReqDto = {
                        /**登录账号 */
                        loginName: string;
                        /**密码 */
                        password: string;
                    };

                    /**创建用户请求对象 */
                    export type CreateUserReqDto = {
                        /**登录账号 */
                        loginName: string;
                        /**昵称 */
                        nickName: string;
                        /**密码 md5 */
                        password: string;
                    };

                    /**修改用户请求对象 */
                    export type UpdateUserReqDto = {
                        /**旧密码 */
                        oldPassword?: string;
                        /**新密码 */
                        newPassword?: string;
                    };

                    export interface GetOperateRecordListReqDto extends PageRequest {
                        /**操作账号 */
                        loginName?: string;
                        /**api */
                        api?: string;
                    }
                }
                export namespace Order {
                    export interface GetOrderDetailReqDto {
                        /**订单id */
                        entityId: string;
                    }
                    export interface GetRechargeOrdersReqDto extends PageRequest {
                        /**订单id */
                        entityId?: string;
                        /**外链充值地址 */
                        walletAddress?: string;
                        /**外链交易hash */
                        walletTxId?: string;
                        /**内链充值到账地址 */
                        internalAddress?: string;
                        /**订单状态 */
                        orderState?: RECHARGE_ORDER_STATE_ID;
                    }

                    export interface FixRechargeOrderReqDto {
                        /**订单id */
                        entityId: string;
                        /**订单修改方式 */
                        fixType: FIX_RECHARGE_ORDER_TYPE;
                    }

                    export interface GetRedemptionOrdersReqDto extends PageRequest {
                        /**订单id */
                        entityId?: string;
                        /**内链发起地址 */
                        internalAddress?: string;
                        /**内链充值交易redemptionTxId */
                        redemptionTxId?: string;
                        /**外链接收地址 */
                        walletAddress?: string;
                        /**外链交易hash */
                        walletTxId?: string;
                        /**订单状态 */
                        orderState?: REDEMPTION_ORDER_STATE_ID;
                    }

                    export interface FixRedemptionOrderReqDto {
                        /**订单id */
                        entityId: string;
                        /**订单修改方式 */
                        fixType: FIX_REDEMPTION_ORDER_TYPE;
                    }
                }

                /**配置管理相关参数 */
                export namespace Config {
                    /**设置充值配置 */
                    export interface SetRechargeConfigReqDto {
                        config: COTCore.Config.BusinessConfig["recharge"];
                    }
                    export type GetRechargeConfigResDto = COTCore.Config.BusinessConfig["recharge"] | undefined;
                }
            }
        }

        /**用户登录返回对象 */
        export type AdminAuthInfo = {
            /**登录账号 */
            loginName: string;
            /**过期时间 */
            expiredTime: number;
            /**token */
            token: string;
        };
    }
}
