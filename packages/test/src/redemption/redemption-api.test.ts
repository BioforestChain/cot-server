import { Injectable } from "@nestjs/common";
import {
    $asyncAllNoNullMap,
    CommonHelper,
    ExternalAssetType,
    ExternalChainName,
    InternalAssetType,
    InternalChainName,
    Logger,
    redisCore,
    staticConfig,
    transactionMaker,
    walletSdk,
} from "@cot/server";
import { CommonTest } from "../common/common.test";
import { RedemptionApi } from "../api/redemption.api";
import { TransApi } from "../api/trans.api";
import { ExternalTransferApi } from "../api/external-transfer.api";
import { BSC_MNEMONIC, ETH_MNEMONIC, TRON_MNEMONIC_1 } from "../constant";

@Injectable()
export class RedemptionApiTest extends CommonTest {
    // 平台赎回账号
    private __platformRecipientId = "c54DUEYsc7EGSnm18g3jx5SqFH975ycKGY";

    async execute() {
        await redisCore.connect(staticConfig.redis.server);

        let funcNames: (keyof RedemptionApiTest)[] = [];
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
        try {
            const ethApi = walletSdk.walletFactory.EthApi.web3.eth;
            const ethHeight = await ethApi.getBlockNumber();
            Logger.debug(`ethHeight = ${ethHeight}`);
            const bscApi = walletSdk.walletFactory.BscApi.web3.eth;
            const bscHeight = await bscApi.getBlockNumber();
            Logger.debug(`bscHeight = ${bscHeight}`);
            const block = await walletSdk.walletFactory.TronApi.getCurrentBlock();
            const tronHeight = block.block_header.raw_data.number;
            Logger.debug(`tronHeight = ${tronHeight}`);
        } catch (e) {
            console.error(e);
        }
        // await this.redemption();
        // await this.redemptionV2("asdasd");
        await this.redemptionV2Trx("asdasd");
    }

    /**
     * 赎回相关测试
     */
    async redemption() {
        const rechargeNum = 1;
        const accounts = await this.getLoginAccounts(rechargeNum);
        await this.__ethRedemption(accounts);
        await this.__bscRedemption(accounts);
        await this.__tronRedemption(accounts);
    }

    private async __ethRedemption(accounts: COTServerTest.Account[]) {
        const { from } = ExternalTransferApi.parseEthAccount({ mnemonic: ETH_MNEMONIC });
        const remark: COTCore.Redemption.TransRemark = {
            chainName: ExternalChainName.ETH,
            address: from,
            assetType: ExternalAssetType.USDC,
        };
        await $asyncAllNoNullMap(accounts, async (account) => {
            await this.__redemption(account, remark);
        });
    }

    private async __bscRedemption(accounts: COTServerTest.Account[]) {
        const { from } = ExternalTransferApi.parseEthAccount({ mnemonic: BSC_MNEMONIC });
        const remark: COTCore.Redemption.TransRemark = {
            chainName: ExternalChainName.BSC,
            address: from,
            assetType: ExternalAssetType.USDC,
        };
        await $asyncAllNoNullMap(accounts, async (account) => {
            await this.__redemption(account, remark);
        });
    }

    private async __tronRedemption(accounts: COTServerTest.Account[]) {
        const tronApi = walletSdk.walletFactory.TronApi;
        const { address: addressTrx } = await tronApi.recoverAccount(TRON_MNEMONIC_1);
        const addressTrxHex = await tronApi.addressToHex(addressTrx);
        const remark: COTCore.Redemption.TransRemark = {
            chainName: ExternalChainName.TRON,
            address: addressTrxHex,
            assetType: ExternalAssetType.USDT,
        };
        await $asyncAllNoNullMap(accounts, async (account) => {
            await this.__redemption(account, remark);
        });
    }

    private async __redemption(account: COTServerTest.Account, remark: COTCore.Redemption.TransRemark) {}

    private async redemptionV2(secret: string) {
        const remark: COTCore.Redemption.TransRemark = {
            /**外链名 */
            chainName: ExternalChainName.TRON,
            /**外链地址 */
            address: "41f469e442cf6c2810b4499b077ab914284b7aa3ca",
            /**外链货币类型 */
            assetType: ExternalAssetType.USDT,
        };
        const tronApi = walletSdk.walletFactory.TronApi;
        const add = await tronApi.addressToBase58("41f469e442cf6c2810b4499b077ab914284b7aa3ca");
        console.log(add);
        const chainName = InternalChainName.BIWMETA;
        const maker = await transactionMaker.getTrMaker(chainName);
        const result = await maker.transaction.generateDestroyAsset({
            secret: secret,
            fee: "3000",
            recipientId: "cKFyTV2yNmCxdsnoLSbT25zKTYVa4kHv1e",
            applyBlockHeight: await TransApi.getLastblockHeight(chainName, this.defaultwalletNetwork),
            assetInfo: {
                amount: "17000",
                assetType: InternalAssetType.USDT,
            },
            remark: remark as unknown as { [key: string]: string },
        });
        if (!result.success) {
            throw result;
        }
        const trJson = result.result as WalletTypings.InternalChain.DestroyAssetTransaction;
        Logger.debug(`transactionJSON = `, JSON.stringify(trJson, null, 2));
        const redemptionRes = await RedemptionApi.redemptionV2(
            {
                fromTrJson: {
                    bcf: { chainName, trJson },
                },
            },
            this.defaultNetwork,
        );
        Logger.debug(`redemption done. `, redemptionRes);
    }

    private async redemptionV2Trx(secret: string) {
        const remark: COTCore.Redemption.TransRemark = {
            /**外链名 */
            chainName: ExternalChainName.TRON,
            /**外链地址 */
            address: "41f469e442cf6c2810b4499b077ab914284b7aa3ca",
            /**外链货币类型 */
            assetType: "TRX" as any,
        };
        const tronApi = walletSdk.walletFactory.TronApi;
        const add = await tronApi.addressToBase58("41f469e442cf6c2810b4499b077ab914284b7aa3ca");
        console.log(add);
        const chainName = InternalChainName.BIWMETA;
        const maker = await transactionMaker.getTrMaker(chainName);
        const result = await maker.transaction.generateDestroyAsset({
            secret: secret,
            fee: "3000",
            recipientId: "cNH7viNzgbHHoZQj6sbvYrHGX62Pr767ot",
            applyBlockHeight: await TransApi.getLastblockHeight(chainName, this.defaultwalletNetwork),
            assetInfo: {
                amount: "17000",
                assetType: "BTRX",
            },
            remark: remark as unknown as { [key: string]: string },
        });
        if (!result.success) {
            throw result;
        }
        const trJson = result.result as WalletTypings.InternalChain.DestroyAssetTransaction;
        Logger.debug(`transactionJSON = `, JSON.stringify(trJson, null, 2));
        const redemptionRes = await RedemptionApi.redemptionV2(
            {
                fromTrJson: {
                    bcf: { chainName, trJson },
                },
            },
            this.defaultNetwork,
        );
        Logger.debug(`redemption done. `, redemptionRes);
    }
}
