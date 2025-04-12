import { CHAIN_ID } from "@cot/core";

export {};
declare global {
    export namespace Payment {
        export namespace Verify {
            export type JWTPayload = {
                deviceId: string;
                // verifyCode: string;
                expiredTime: Date;
            };

            export type Options = {
                address: string;
                publicKey?: string;
            };

            export type TokenCacheInfo = {
                /**设备 id */
                deviceId: string;
                // /**验证码 */
                // verifyCode: string;
                /**授权信息 */
                authInfos: {
                    /**链 id */
                    chainId: CHAIN_ID;
                    /**地址 */
                    address: string;
                }[];
                /**地址对应邀请码 */
                addressCode: { [address: string]: string };
                /**过期时间 */
                expiredTime: number;
            };
        }
    }
}
