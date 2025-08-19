import { CHAIN_ID, ExternalAssetType, ExternalChainName } from "@bnqkl/wallet-typings";
import { INTERNAL_CHAIN_RW_ACCOUNT_TYPE } from "../typings/index.js";

export {};
declare global {
    export namespace COTCore {
        export namespace Verify {
            export namespace Api {
                /**获取验证码请求参数 */
                export type GetVerifyCodeReqDto = {
                    /**设备 id */
                    deviceId: string;
                };
                /**获取验证码返回值 */
                export type GetVerifyCodeResDto = {
                    /**设备 id */
                    deviceId: string;
                    // /**验证码 */
                    // verifyCode: string;
                    /**过期时间 */
                    expiredTime: Date;
                };

                /**获取 token 码请求参数 */
                export type GetTokenReqDto = {
                    /**设备 id */
                    deviceId: string;
                    // /**验证码 */
                    // verifyCode: string;
                    /**授权信息 1-10 条 */
                    authInfos: AuthInfo[];
                };
                /**获取 token 返回值 */
                export type GetTokenResDto = GetTokenReqDto & {
                    /**授权码 */
                    token: string;
                    /**过期时间 */
                    expiredTime: Date;
                    /**地址对应邀请码 */
                    addressCode: { [address: string]: string };
                };

                /**设置配置 */
                export type SetBusinessConfigReqDto = {
                    /**配置生成的加密数据 base64 */
                    config: string;
                };
                /**设置配置 */
                export type SetBusinessConfigResDto = boolean;

                /**获取配置 */
                export type GetBusinessConfigResDto = {
                    /**配置信息 */
                    config: Config.BusinessConfig;
                };

                /**注入外链私钥 */
                export interface InjectExternalAddressReqDto {
                    chainName: ExternalChainName;
                    assetType: ExternalAssetType;
                    keypairStr: string;
                }

                /**注入私钥 */
                export type InjectAddressReqDto = {
                    accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE;
                    keypairStr: string;
                };
                /**设置配置 */
                export type InjectAddresResDto = boolean;

                /**注入的地址 */
                export type GetInjectAddressResDto = {
                    addressObj: { [accountType: string]: string };
                };
            }

            export type AccountType = { keypair: BFMetaSignUtil.Keypair; secret: string };

            /**授权信息 */
            export type AuthInfo = {
                /**链 id */
                chainId: CHAIN_ID;
                /**地址 */
                address: string;
                /**公钥 */
                publicKey?: string;
                /**签名 */
                signature: string;
            };

            /**验签信息 */
            export interface SignatureInfo extends CommonData {
                signature: string;
                publicKey: string;
            }

            /**通用验签data */
            export interface CommonData {
                timestamp: number;
            }
        }
    }
}
