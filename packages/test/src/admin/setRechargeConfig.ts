import { NetWorkHelper, staticConfig } from "@bnqkl/cot-server";
import { AdminApi } from "./api.js";
import { EncryptHelper } from "@bnqkl/server-util";
import * as crypto from "crypto";

import { ETH_SEPOLIA_TEST_LINK_ADDRESS } from "@bfmeta/wallet-eth";
import { BSC_TEST_USDT_ADDRESS } from "@bfmeta/wallet-bsc";
import { TRON_TEST_USDT_ADDRESS_HEX } from "@bfmeta/wallet-tron";

import { bfmetaSignUtil, ExternalChainName, timeTool, InternalChainName, InternalAssetType } from "@bnqkl/cot-server";

(async () => {
    try {
        const username = "syj";
        const p = "123123";
        const password = EncryptHelper.SHA256JS(p);
        const z = crypto.createHash("sha256").update(p).digest("hex");
        const networkHelper = new NetWorkHelper(staticConfig.test.serverIp ?? "localhost", staticConfig.test.port ?? staticConfig.ports.web);
        const loginResult = await AdminApi.login({ loginName: username, password }, networkHelper);
        networkHelper.httpToken = loginResult.token;

        const config: COTCore.Api.Admin.Config.SetRechargeConfigReqDto = {
            config: {
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
                            min: "100000000" as any,
                            max: "10000000000000000" as any,
                            radioFee: "0",
                            fee: {
                                [ExternalChainName.ETH]: "20000000",
                                [ExternalChainName.BSC]: "10000000",
                                [ExternalChainName.TRON]: "15000000",
                            },
                        },
                    },
                },
            },
        };

        const result = await AdminApi.setRecharge(config, networkHelper);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
})();
