import { Injectable } from "@nestjs/common";
import {
    $asyncAllNoNullMap,
    bfmetaSignUtil,
    NUMBER_OF_EFFECTIVE_BLOCKS,
    sleep,
    walletSdk,
    InternalChainName,
    ChainHelper,
    Logger,
    transactionMaker,
    DEFAULT_FEE,
    CHAIN_NETWORK_TYPE,
    staticConfig,
} from "@cot/server";
import { TransApi } from "../api/trans.api";
import { CommonTest } from "../common/common.test";
import { BSC_TEST_USDT_ADDRESS } from "@bfmeta/wallet-bsc";
import { GENESIS_SECRET } from "../constant";

@Injectable()
export class TransApiTest extends CommonTest {
    async execute() {
        let funcNames: (keyof TransApiTest)[] = [];
        // funcNames.push("pmChainTransfer");
        // funcNames.push("createBscTrans");
        funcNames.push("testMaker");

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

    /**
     * 支付链转账
     */
    async pmChainTransfer() {
        const accounts = await this.getLoginAccounts(2);
        const sender = accounts[0];
        const recver = accounts[1];
        const { walletNetwork } = sender;
        const chainName = InternalChainName.PMCHAIN;
        const createTransferDto: BFMetaNodeSDK.Transaction.TransferAssetTransactionParams = {
            amount: "10000000000",
            publicKey: sender.info.keypair.publicKey.toString("hex"),
            recipientId: recver.info.address,
            fee: "2000",
            applyBlockHeight: await TransApi.getLastblockHeight(chainName, walletNetwork),
            numberOfEffectiveBlocks: 50,
            remark: { timestamp: Date.now().toString() },
        };
        Logger.debug(`createTransferDto =`, JSON.stringify(createTransferDto, null, 2));
        const { buffer } = await TransApi.createTransferAsset(chainName, createTransferDto, walletNetwork);
        const bytes = Buffer.from(buffer, "base64");
        const signature = (await bfmetaSignUtil.detachedSign(bytes, sender.info.keypair.secretKey)).toString("hex");
        const trJSON = await TransApi.broadcastTransferAsset(chainName, { buffer, signature }, walletNetwork);
        Logger.debug(`transfer success. trJSON =`, JSON.stringify(trJSON, null, 2));
    }

    async createBscTrans() {
        const { walletNetwork } = (await this.getLoginAccounts())[0];
        const privateKey = "7d672dd3c7e63a856e11a114464448f3f320e52d22e5268c23e485d11a25119a";
        const account = walletSdk.walletFactory.BscApi.web3.eth.accounts.privateKeyToAccount(privateKey);
        const from = account.address;
        await TransApi.createBscBep20Trans(
            {
                from,
                to: "0x3549613447bD0B04d9862c6c2Ad847D1B4Aa1a8A",
                amount: "6660000000000",
                assetSymbol: "USDT",
                privateKey,
                contract: BSC_TEST_USDT_ADDRESS,
            },
            walletNetwork,
        );
    }

    async testMaker() {
        const num = 1;
        const accounts = await this.getLoginAccounts(num);
        let success = 0;
        const ds = Date.now();
        const chainName = InternalChainName.PMCHAIN;
        await $asyncAllNoNullMap(accounts, async ({ info, walletNetwork }) => {
            const data: TransactionMaker.Transaction.TransferAssetTransactionParams = {
                // 私钥
                secret: GENESIS_SECRET,
                // 接受方账户
                recipientId: info.address,
                // 手续费
                fee: DEFAULT_FEE,
                applyBlockHeight: await TransApi.getLastblockHeight(chainName, walletNetwork),
                numberOfEffectiveBlocks: NUMBER_OF_EFFECTIVE_BLOCKS,
                remark: { type: "TRANSFER" },
                assetInfo: {
                    assetType: ChainHelper.getInternalMainAssetType(chainName, staticConfig.chainConfig.chainNetworkType === CHAIN_NETWORK_TYPE.TESTNET),
                    // 支付账户的金额
                    amount: "490000000",
                },
            };
            const promises: Promise<any>[] = [];
            const count = 200000;
            const transfer = async () => {
                const maker = await transactionMaker.getTrMaker(chainName);
                const result = await maker.transaction.generateTransferAsset(data);
                if (result.success) {
                    success++;
                    Logger.debug(`success:${success}`);
                } else {
                    await sleep(30 * 1000);
                    await transfer();
                }
            };
            for (let i = 0; i < count; i++) {
                promises.push(transfer());
            }
            await Promise.all(promises);
        });
        Logger.debug(`success:${success} costTime ${Date.now() - ds} ms`);
    }
}
