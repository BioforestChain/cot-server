import { Injectable } from "@nestjs/common";
import { walletSdk, InternalChainName, staticConfig, NetWorkHelper, transactionMaker } from "@bnqkl/cot-server";
import { TransApi } from "../api/trans.api.js";
import * as fs from "fs";
const accounts: { secret: string; address: string }[] = require(process.cwd() + "/accounts.json");
@Injectable()
export class TransApiTest {
    async createAccount() {
        // bfmetaSignUtil.createKeypair("")
        console.log(`111`);
        const accounts: { secret: string; address: string }[] = [];
        for (let i = 0; i < 100; i++) {
            const result = await walletSdk.BFCHAINV2Api.sdk.api.basic.generateSecret({ lang: "en" });
            if (result.success) {
                const secret = result.result.secret;
                const address = await walletSdk.bfmetaSignUtil.getAddressFromSecret(secret);
                accounts.push({ secret, address });
            }
        }
        console.log(`success`);
        fs.writeFileSync(process.cwd() + "/accounts.json", JSON.stringify(accounts, undefined, 4));
    }

    async pmctranfser(recipientId: string, applyBlockHeight: number) {
        // 转usdm
        const maker = await transactionMaker.getTrMaker(InternalChainName.PMCHAIN);
        const z1 = await maker.transaction.generateTransferAsset({
            // 私钥
            secret: "test_usdm",
            // 接受方账户
            recipientId,
            // 手续费
            fee: "30000",
            applyBlockHeight: applyBlockHeight, //, await TransApi.getPmchainLastblockHeight(walletNetwork),
            numberOfEffectiveBlocks: 30,
            assetInfo: {
                assetType: "USDM",
                // 支付账户的金额
                amount: "1000000000",
            },
        });
        if (z1.success) {
            const r1 = await walletSdk.PMChainApi.sdk.api.transaction.broadcastCompleteTransaction(z1.result);
            console.log(r1);
        }
        // 转主权益
        const z2 = await maker.transaction.generateTransferAsset({
            // 私钥
            secret: "nose install correct solar side latin focus churn mask nominee differ mosquito claw awake glass rare pond clump draw rent fiction muscle razor bacon",
            // 接受方账户
            recipientId,
            // 手续费
            fee: "30000",
            applyBlockHeight: applyBlockHeight, //, await TransApi.getPmchainLastblockHeight(walletNetwork),
            numberOfEffectiveBlocks: 30,
            assetInfo: {
                //   assetType: RechargeHelper.getRechargeMainAssetType(InternalChainName.PMCHAIN),
                // 支付账户的金额
                amount: "100000000",
            },
        });
        if (z2.success) {
            const r2 = await walletSdk.PMChainApi.sdk.api.transaction.broadcastCompleteTransaction(z2.result);
            console.log(r2);
        }
    }

    async ethmtranfser(recipientId: string, applyBlockHeight: number) {
        // 转usdm
        const maker = await transactionMaker.getTrMaker(InternalChainName.ETHMETA);
        const z1 = await maker.transaction.generateTransferAsset({
            // 私钥
            secret: "test_usdm",
            // 接受方账户
            recipientId,
            // 手续费
            fee: "30000",
            applyBlockHeight: applyBlockHeight, //, await TransApi.getPmchainLastblockHeight(walletNetwork),
            numberOfEffectiveBlocks: 30,
            assetInfo: {
                assetType: "USDM",
                // 支付账户的金额
                amount: "1000000000",
            },
        });
        if (z1.success) {
            const r1 = await walletSdk.ETHMChainApi.sdk.api.transaction.broadcastCompleteTransaction(z1.result);
            console.log(r1);
        }
        // 转主权益
        const z2 = await maker.transaction.generateTransferAsset({
            // 私钥
            secret: "nose install correct solar side latin focus churn mask nominee differ mosquito claw awake glass rare pond clump draw rent fiction muscle razor bacon",
            // 接受方账户
            recipientId,
            // 手续费
            fee: "30000",
            applyBlockHeight: applyBlockHeight, //, await TransApi.getPmchainLastblockHeight(walletNetwork),
            numberOfEffectiveBlocks: 30,
            assetInfo: {
                //   assetType: RechargeHelper.getRechargeMainAssetType(InternalChainName.PMCHAIN),
                // 支付账户的金额
                amount: "100000000",
            },
        });
        if (z2.success) {
            const r2 = await walletSdk.ETHMChainApi.sdk.api.transaction.broadcastCompleteTransaction(z2.result);
            console.log(r2);
        }
    }

    async transafer() {
        const walletNetwork = new NetWorkHelper(staticConfig.wallet.ip, staticConfig.wallet.port);
        const pmcHeight = await TransApi.getLastblockHeight(InternalChainName.PMCHAIN, walletNetwork);
        const ethmHeight = await TransApi.getLastblockHeight(InternalChainName.ETHMETA, walletNetwork);
        for (const account of accounts) {
            // await this.pmctranfser(account.address, pmcHeight);
            await this.ethmtranfser(account.address, ethmHeight);
        }
        console.log(`end`);
    }
}

(async () => {
    try {
        const t = new TransApiTest();
        // t.createAccount();
        t.transafer();
    } catch (err) {
        console.log(err);
    }
})();
