import { HttpHelper } from "../httpHelper";
import { setConfig } from "./api";
import { ETH_SEPOLIA_TEST_LINK_ADDRESS } from "@bfmeta/wallet-eth";
import { BSC_TEST_USDT_ADDRESS } from "@bfmeta/wallet-bsc";
import { TRON_TEST_USDT_ADDRESS_HEX } from "@bfmeta/wallet-tron";

import { bfmetaSignUtil, ExternalChainName, timeTool, InternalChainName, InternalAssetType } from "@cot/server";

(async () => {
    try {
        const httpHelper = new HttpHelper("https://walletapi.bfmeta.info", 443);

        const serverPublicKey = await bfmetaSignUtil.getPublicKeyBySecret("rec6hhioa");
        const config: any = {
            recharge: {
                BFMCHAIN: {
                    USDT: {
                        enable: true,
                        chainName: "BFMCHAIN",
                        assetType: "USDT",
                        applyAddress: "b92ZZCvyDRn8XuSigmQQzzwxKo9iByVdpF",
                        supportChain: {
                            ETH: {
                                enable: true,
                                contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                                depositAddress: "0xBbE1876CdE47578019e26b87Eb08A6499D18Feb2",
                                assetType: "USDT",
                                logo: "https://pm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/web3-icon/eth/icon-USDT(ERC20).png",
                            },
                            BSC: {
                                enable: true,
                                contract: "0x55d398326f99059fF775485246999027B3197955",
                                depositAddress: "0x8F34E8fb26659bdD860c7E0752c04c2Da86e357D",
                                assetType: "USDT",
                                logo: "https://pm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/web3-icon/bsc/icon-USDT(BEP20).png",
                            },
                            TRON: {
                                enable: true,
                                contract: "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",
                                depositAddress: "412c9d3ed50dd097bc491d4164e39fe14d5288b554",
                                assetType: "USDT",
                                logo: "https://pm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/web3-icon/tron/icon-USDT(TRC20).png",
                            },
                        },
                        redemption: {
                            enable: true,
                            min: "1",
                            max: "10000000000000000",
                            radioFee: "0",
                            fee: {
                                ETH: "700000000",
                                BSC: "50000000",
                                TRON: "150000000",
                            },
                        },
                        logo: "https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/biwm/icon-USDT.png",
                    },
                },
            },
        };
        const encryptedConfig = await bfmetaSignUtil.encryptData(config, "g42hqibk", serverPublicKey);
        const result = await setConfig(httpHelper, {
            config: encryptedConfig,
        });
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
})();
