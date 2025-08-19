import { Injectable } from "@nestjs/common";
import {
    $asyncAllNoNullMap,
    $asyncNoNullMap,
    bfmetaSignUtil,
    CommonHelper,
    encodeRechargeV2ToTrInfoData,
    InternalAssetType,
    InternalChainName,
    Logger,
    RechargeHelper,
    redisCore,
    sleep,
    staticConfig,
} from "@bnqkl/cot-server";
import { RechargeApi } from "../api/recharge.api.js";
import { CommonTest } from "../common/common.test.js";
import { ExternalTransferApi } from "../api/external-transfer.api.js";
import { BSC_MNEMONIC, BSC_PRIVATEKEY, ETH_MNEMONIC, TRON_MNEMONIC_1 } from "../constant.js";

@Injectable()
export class RechargeApiTest extends CommonTest {
    async execute() {
        await redisCore.connect(staticConfig.redis.server);

        let funcNames: (keyof RechargeApiTest)[] = [];
        // funcNames.push("setInviteCode");
        funcNames.push("test");

        for (let idx = 0; idx < funcNames.length; idx++) {
            const funcName = funcNames[idx];
            const promise = (this[funcName] as () => Promise<any>)();
            if (!promise) {
                continue;
            }
            try {
                const value = await promise;
                let data = `idx: ${idx} name: ${funcNames[idx]} --- ${JSON.stringify(value, null, 2)}`;
                Logger.debug(data);
            } catch (e) {
                let data = `error. idx: ${idx} name: ${funcNames[idx]} ---`;
                Logger.debug(data, e);
            }
        }
    }

    async test() {
        await this.rechargeV2("zxcdqqggg");
        // if (await RechargeHelper.isRechargeDevTest()) {
        //     await this.rechargeTest();
        // } else {
        //     await this.recharge();
        // }
    }

    // /**
    //  * 充值相关测试
    //  */
    // async rechargeTest() {
    //     const rechargeNum = staticConfig.test.rechargeNum;
    //     const accounts = await this.getLoginAccounts(rechargeNum);
    //     await $asyncAllNoNullMap(accounts, async ({ info, serverNetwork }) => {
    //         let round = 1;
    //         while (true) {
    //             RechargeApi.recharge(
    //                 {
    //                     fromTrJson: {
    //                         bsc: {
    //                             signTransData: CommonHelper.getUuid(),
    //                         },
    //                     },
    //                     toTrInfo: {
    //                         chainName: InternalChainName.PMCHAIN,
    //                         address: info.address,
    //                     },
    //                 },
    //                 serverNetwork,
    //             );
    //             Logger.debug(`account:${info.address} round:${round++} success.`);
    //             await sleep(1000);
    //         }
    //     });
    // }

    // /**
    //  * 充值相关测试
    //  */
    // async recharge() {
    //     const rechargeNum = 1;
    //     const accounts = await this.getLoginAccounts(rechargeNum);
    //     // await this.bep20Transaction(accounts);
    //     await this.trc20Transaction(accounts);
    //     await this.erc20Transaction(accounts);
    // }

    // async erc20Transaction(accounts: COTServerTest.Account[]) {
    //     const transferNum = 2;
    //     await $asyncAllNoNullMap(accounts, async ({ info, serverNetwork, walletNetwork }) => {
    //         const signTransDatas = await ExternalTransferApi.ethMultiTransfer(
    //             {
    //                 account: {
    //                     mnemonic: ETH_MNEMONIC,
    //                 },
    //                 to: "0xf563CEa8C4777E2E32629a9FBba7B1E91C182e56",
    //                 contractAddress: "0xbe72E441BF55620febc26715db68d3494213D8Cb",
    //                 amount: "1050000",
    //             },
    //             transferNum,
    //             walletNetwork,
    //         );
    //         await $asyncAllNoNullMap(Array.from(new Set(signTransDatas)), async ({ rawTrans, txHash }) => {
    //             Logger.debug(`recharge <eth> rawTrans:${rawTrans} txHash:${txHash}`);
    //             const rechargeRes = await RechargeApi.recharge(
    //                 {
    //                     fromTrJson: {
    //                         eth: {
    //                             signTransData: rawTrans,
    //                         },
    //                     },
    //                     toTrInfo: {
    //                         chainName: InternalChainName.ETHMETA,
    //                         address: info.address,
    //                     },
    //                 },
    //                 serverNetwork,
    //             );
    //             Logger.debug(`recharge <eth> done. `, rechargeRes);
    //         });
    //     });
    // }

    // async bep20Transaction(accounts: COTServerTest.Account[]) {
    //     const transferNum = 2;
    //     await $asyncAllNoNullMap(accounts, async ({ info, serverNetwork, walletNetwork }) => {
    //         const signTransDatas = await ExternalTransferApi.bscMultiTransfer(
    //             {
    //                 account: {
    //                     mnemonic: BSC_MNEMONIC,
    //                 },
    //                 to: "0x3549613447bD0B04d9862c6c2Ad847D1B4Aa1a8A",
    //                 contractAddress: "0x8455467dC4a4a077FE3e9d2D79f3329C010Cd286",
    //                 amount: "67890000000000",
    //             },
    //             transferNum,
    //             walletNetwork,
    //         );
    //         await $asyncAllNoNullMap(Array.from(new Set(signTransDatas)), async ({ rawTrans, txHash }) => {
    //             Logger.debug(`recharge <bsc> rawTrans:${rawTrans} txHash:${txHash}`);
    //             const rechargeRes = await RechargeApi.recharge(
    //                 {
    //                     fromTrJson: {
    //                         bsc: {
    //                             signTransData: rawTrans,
    //                         },
    //                     },
    //                     toTrInfo: {
    //                         chainName: InternalChainName.ETHMETA,
    //                         address: info.address,
    //                     },
    //                 },
    //                 serverNetwork,
    //             );
    //             Logger.debug(`recharge <bsc> done. `, rechargeRes);
    //         });
    //     });
    // }

    // async trc20Transaction(accounts: COTServerTest.Account[]) {
    //     const transferNum = 2;
    //     // 进行trc20协议的 USDT 交易流程
    //     await $asyncAllNoNullMap(accounts, async ({ info, serverNetwork, walletNetwork }) => {
    //         const transactionWithSigns = await ExternalTransferApi.trc20MultiTransfer(
    //             {
    //                 account: {
    //                     mnemonic: TRON_MNEMONIC_1,
    //                 },
    //                 to: "412b40b43fed1d8704f21e11d8d66d29d495a97751",
    //                 contractAddress: "41ea51342dabbb928ae1e576bd39eff8aaf070a8c6",
    //                 amount: "3366000",
    //             },
    //             transferNum,
    //             walletNetwork,
    //         );
    //         await $asyncAllNoNullMap(
    //             transactionWithSigns.filter((item, index, self) => self.findIndex((i) => i.txID === item.txID) === index),
    //             async (transactionWithSign) => {
    //                 Logger.debug(`recharge <tron> `, transactionWithSign);
    //                 // 交易广播
    //                 const rechargeRes = await RechargeApi.recharge(
    //                     {
    //                         fromTrJson: {
    //                             trc20: transactionWithSign as Required<BFChainWallet.TRON.Trc20Transaction>,
    //                         },
    //                         toTrInfo: {
    //                             chainName: InternalChainName.PMCHAIN,
    //                             address: info.address,
    //                         },
    //                     },
    //                     serverNetwork,
    //                 );
    //                 Logger.debug(`recharge <tron> done. `, rechargeRes);
    //             },
    //         );
    //     });
    // }

    async rechargeV2(secret: string) {
        const recipientAddress = "41daadca07f5fbd520ff1ea37fb4c970079a2b798e";
        const contractAddress = "41ea51342dabbb928ae1e576bd39eff8aaf070a8c6";
        const bcfAccount = await bfmetaSignUtil.createKeypair(secret);
        const publicKey = bcfAccount.publicKey.toString("hex");
        const address = await bfmetaSignUtil.getAddressFromPublicKeyString(publicKey);
        // 进行trc20协议的 USDT 交易流程
        const transactionWithSign = await ExternalTransferApi.trc20Transfer(
            {
                account: {
                    mnemonic: TRON_MNEMONIC_1,
                },
                to: recipientAddress,
                contractAddress,
                amount: "4557",
            },
            this.defaultwalletNetwork,
        );
        Logger.debug(`rechargeV2 <tron> `, transactionWithSign);
        // 交易广播

        const message = {
            address,
            chainName: InternalChainName.BIWMETA,
            assetType: InternalAssetType.USDT,
            /**时间戳 */
            timestamp: Date.now(),
        };
        const signature = (await bfmetaSignUtil.detachedSign(Buffer.from(encodeRechargeV2ToTrInfoData(message)), bcfAccount.secretKey)).toString("hex");
        const result = await RechargeApi.rechargeV2(
            {
                fromTrJson: {
                    trc20: transactionWithSign as Required<BFChainWallet.TRON.Trc20Transaction>,
                },
                /**待签字段 */
                message,
                /**验签信息 */
                signatureInfo: {
                    signature,
                    publicKey: publicKey,
                    timestamp: message.timestamp,
                },
            },
            this.defaultNetwork,
        );
        Logger.debug(`rechargeV2 <tron> done. `, result);
    }

    async rechargeV2Trx(secret: string) {
        const recipientAddress = "412b40b43fed1d8704f21e11d8d66d29d495a97751";
        const bcfAccount = await bfmetaSignUtil.createKeypair(secret);
        const publicKey = bcfAccount.publicKey.toString("hex");
        const address = await bfmetaSignUtil.getAddressFromPublicKeyString(publicKey);
        const transactionWithSign = await ExternalTransferApi.trxTransfer(
            {
                account: {
                    mnemonic: TRON_MNEMONIC_1,
                },
                to: recipientAddress,
                amount: "4555",
            },
            this.defaultwalletNetwork,
        );
        Logger.debug(`rechargeV2 <tron> `, transactionWithSign);
        // 交易广播

        const message: any = {
            address,
            chainName: InternalChainName.BIWMETA,
            assetType: "BTRX",
            /**时间戳 */
            timestamp: Date.now(),
        };
        const signature = (await bfmetaSignUtil.detachedSign(Buffer.from(encodeRechargeV2ToTrInfoData(message)), bcfAccount.secretKey)).toString("hex");
        const result = await RechargeApi.rechargeV2(
            {
                fromTrJson: {
                    tron: transactionWithSign as Required<BFChainWallet.TRON.TronTransaction>,
                },
                /**待签字段 */
                message,
                /**验签信息 */
                signatureInfo: {
                    signature,
                    publicKey: publicKey,
                    timestamp: message.timestamp,
                },
            },
            this.defaultNetwork,
        );
        Logger.debug(`rechargeV2 <tron> done. `, result);
    }
}
