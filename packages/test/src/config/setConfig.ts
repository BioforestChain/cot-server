import { HttpHelper } from "../httpHelper";
import { setConfig } from "./api";
import { ETH_SEPOLIA_TEST_LINK_ADDRESS } from "@bfmeta/wallet-eth";
import { BSC_TEST_USDT_ADDRESS } from "@bfmeta/wallet-bsc";
import { TRON_TEST_USDT_ADDRESS_HEX } from "@bfmeta/wallet-tron";

import { bfmetaSignUtil, ExternalChainName, timeTool, InternalChainName, InternalAssetType } from "@cot/server";

(async () => {
    try {
        const httpHelper = new HttpHelper();

        const serverPublicKey = await bfmetaSignUtil.getPublicKeyBySecret("serverKey");
        const config: COTCore.Config.BusinessConfig = {
            recharge: {
                [InternalChainName.BIWMETA]: {
                    [InternalAssetType.USDT]: {
                        enable: true,
                        /**支持的链 */
                        chainName: InternalChainName.BIWMETA,
                        /**充值的代币名称 */
                        assetType: InternalAssetType.USDT,
                        /**内链币的发行地址 */
                        applyAddress: "cKFyTV2yNmCxdsnoLSbT25zKTYVa4kHv1e",
                        /**外链充值支持 */
                        supportChain: {
                            ETH: {
                                /**兑换是否开启 */
                                enable: true,
                                /**合约 */
                                contract: ETH_SEPOLIA_TEST_LINK_ADDRESS,
                                depositAddress: "0xf563CEa8C4777E2E32629a9FBba7B1E91C182e56",
                                /**资产名 显示用 */
                                assetType: "USDT",
                            },
                            BSC: {
                                /**兑换是否开启 */
                                enable: true,
                                /**合约 */
                                contract: BSC_TEST_USDT_ADDRESS,
                                depositAddress: "0x3549613447bD0B04d9862c6c2Ad847D1B4Aa1a8A",
                                /**资产名 显示用 */
                                assetType: "USDT",
                            },
                            TRON: {
                                /**兑换是否开启 */
                                enable: true,
                                /**合约 */
                                contract: TRON_TEST_USDT_ADDRESS_HEX,
                                depositAddress: "412b40b43fed1d8704f21e11d8d66d29d495a97751",
                                /**资产名 显示用 */
                                assetType: "USDT",
                            },
                        },
                        /**赎回 */
                        redemption: {
                            enable: true,
                            min: "1" as any,
                            max: "10000000000000000" as any,
                            radioFee: "0",
                            fee: {
                                [ExternalChainName.ETH]: "2000",
                                [ExternalChainName.BSC]: "1000",
                                [ExternalChainName.TRON]: "1500",
                            },
                        },
                    },
                    BTRX: {
                        enable: true,
                        /**支持的链 */
                        chainName: InternalChainName.BIWMETA,
                        /**充值的代币名称 */
                        assetType: "BTRX" as any,
                        /**内链币的发行地址 */
                        applyAddress: "cNH7viNzgbHHoZQj6sbvYrHGX62Pr767ot",
                        /**外链充值支持 */
                        supportChain: {
                            TRON: {
                                /**兑换是否开启 */
                                enable: true,
                                depositAddress: "412b40b43fed1d8704f21e11d8d66d29d495a97751",
                                /**资产名 显示用 */
                                assetType: "TRX",
                            },
                        },
                        /**赎回 */
                        redemption: {
                            enable: true,
                            min: "1" as any,
                            max: "10000000000000000" as any,
                            radioFee: "0",
                            fee: {
                                [ExternalChainName.TRON]: "1500",
                            },
                        },
                    },
                },
            },
        };
        const encryptedConfig = await bfmetaSignUtil.encryptData(config, "clientKey", serverPublicKey);
        const result = await setConfig(httpHelper, {
            config: encryptedConfig,
        });
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
})();
