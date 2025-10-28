import * as bip39 from "bip39";
import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { GlobalValueRedisBaseRepository, InternalChainName, Logger } from "@bnqkl/wallet-sdk";
import { BFMBusinessConfig } from "../memory/memory.define";
import { OrderHelper, bfmetaSignUtil, ipcHelpers, walletSdk, walletServerSdk } from "../../helper";
import * as ethers from "ethers";
import { EasyMap } from "@bnqkl/util-node";
import { ExternalAssetType, ExternalChainName, INTERNAL_CHAIN_RW_ACCOUNT_TYPE } from "@bnqkl/cotcore";
import { CMD, GLOBAL_VALUE_ENTITY_ID, WORKER } from "../../common";

/**全局的Redis数据操作模型 */
@Injectable()
export class GlobalValueRedisRepository extends GlobalValueRedisBaseRepository<COTCore.Config.BusinessConfig> {
    getBfmetaSignUtil() {
        return bfmetaSignUtil;
    }

    async setConfig(encryptConfig: string) {
        const decryptConfigBytes = await this.verifyKey(encryptConfig);
        try {
            const newConfig = JSON.parse(Buffer.from(decryptConfigBytes).toString());
            const config: BFMBusinessConfig = plainToClass(BFMBusinessConfig, newConfig);
            // 校验config合法性

            await validate(config).then((errors) => {
                if (errors.length > 0) {
                    throw new Error(`config validate error: ${errors}`);
                }
            });
            const recharge = config.recharge;
            for (const internalChainName in recharge) {
                for (const assetType in recharge[internalChainName]) {
                    const item: COTCore.Config.RechargeItem = recharge[internalChainName][assetType];
                    const info = await walletServerSdk.getAssetDetails({
                        chainName: internalChainName as InternalChainName,
                        assetType: assetType,
                    });
                    item.logo = info.iconUrl;
                    for (const _chain in item.supportChain) {
                        const externalItem = item.supportChain[_chain] as COTCore.Config.ExternalAssetInfoItem;
                        if (externalItem.contract) {
                            const contractTokenInfo = await OrderHelper.getContractTokenInfo(_chain as ExternalChainName, externalItem.contract);
                            externalItem.assetType = contractTokenInfo.symbol;
                            externalItem.logo = contractTokenInfo.icon;
                        }
                        const account = await this.initExternalAccount(_chain as ExternalChainName, externalItem.assetType);
                        let address = account.address;
                        if (_chain === ExternalChainName.TRON) {
                            address = await walletSdk.walletFactory.TronApi.addressToHex(account.address);
                        }
                        externalItem.depositAddress = address;
                    }
                }
            }

            await this.saveConfig(config);
            return true;
        } finally {
        }
    }

    async getConfigByController(verifyKey: string) {
        await this.verifyKey(verifyKey);
        return await this.getConfig();
    }

    private __externalkeypairMap = EasyMap.from({
        creater: (chainName: ExternalChainName) => {
            return new Map<string, WalletTypings.ExternalChain.WalletAccount>();
        },
    });
    private __setExternalKeypair(chainName: ExternalChainName, assetType: string, account: WalletTypings.ExternalChain.WalletAccount) {
        const assetMap = this.__externalkeypairMap.forceGet(chainName);
        if (assetMap.get(assetType)) {
            Logger.warn(`[${chainName}] ${assetType} has been set`);
            return false;
        }
        assetMap.set(assetType, account);
        return true;
    }

    forceGetExternalKeypair(chainName: ExternalChainName, assetType: string) {
        const assetMap = this.__externalkeypairMap.forceGet(chainName);
        const keypair = assetMap.get(assetType);
        if (!keypair) {
            throw new Error(`[${chainName}] ${assetType} is not inject`);
        }
        return keypair;
    }

    async injectExternalAddress(chainName: ExternalChainName, assetType: string, keypairStr: string): Promise<boolean> {
        if (process.env["workerName"] !== `${WORKER.ORDER}`) {
            return await ipcHelpers.request(`${WORKER.ORDER}`, CMD.INJECT_EXTERNAL_SECRET, { chainName, assetType, keypairStr });
        }
        const clientPublicKey = process.env["clientPublicKey"] as string;
        const serverKeypair = await this.getServerKeypair();
        const keypairStrBytes = bfmetaSignUtil.asymmetricDecrypt(
            Buffer.from(keypairStr, "base64"),
            new Uint8Array(Buffer.from(clientPublicKey, "hex")),
            serverKeypair.secretKey,
        );
        if (!keypairStrBytes) {
            Logger.warn(`keypair decrypt fail`);
            return false;
        }
        try {
            const mnemonic: string = JSON.parse(Buffer.from(keypairStrBytes).toString());
            let account = await this.__transformAccount(chainName, mnemonic);
            return this.__setExternalKeypair(chainName, assetType, account);
        } catch (err) {
            Logger.warn(err);
            return false;
        }
    }

    private __getAccountKey(chainName: ExternalChainName, assetType: string) {
        return `${chainName}_${assetType}`;
    }

    private async __transformAccount(chainName: ExternalChainName, secret: string) {
        let account: WalletTypings.ExternalChain.WalletAccount;
        switch (chainName) {
            case ExternalChainName.ETH:
            case ExternalChainName.BSC:
                const ethAccount = ethers.Wallet.fromPhrase(secret);
                account = {
                    secret: secret,
                    address: ethAccount.address,
                    privateKey: ethAccount.privateKey,
                    publicKey: ethAccount.publicKey,
                };
                break;
            case ExternalChainName.TRON:
                const tronAccount = await walletSdk.walletFactory.TronApi.recoverAccount(secret);
                account = {
                    secret: secret,
                    address: tronAccount.address,
                    privateKey: tronAccount.privateKey,
                    publicKey: tronAccount.publicKey,
                };
                break;
            default:
                throw new Error(`invaild chainName:${chainName}`);
        }
        return account;
    }

    async initExternalAccount(chainName: ExternalChainName, assetType: string) {
        const serverKeypair = await this.getServerKeypair();
        const clientPublicKey = process.env["clientPublicKey"] as string;
        const assetMap = this.__externalkeypairMap.forceGet(chainName);
        let account = assetMap.get(assetType);
        if (account) {
            return account;
        } else {
            /**redis里面取 */
            const serverKeypair = await this.getServerKeypair();
            const clientPublicKey = process.env["clientPublicKey"] as string;
            const keyName = this.__getAccountKey(chainName, assetType);
            const redisValue = await this.getKeyValue(GLOBAL_VALUE_ENTITY_ID.ACCOUNT, keyName);
            if (redisValue) {
                // redis取出来以后再解密
                const bytes = bfmetaSignUtil.asymmetricDecrypt(
                    Buffer.from(redisValue, "base64"),
                    new Uint8Array(Buffer.from(clientPublicKey, "hex")),
                    serverKeypair.secretKey,
                );
                if (!bytes) {
                    throw Error(`decrypt fail`);
                }
                const secret = Buffer.from(bytes).toString();

                account = await this.__transformAccount(chainName, secret);
                assetMap.set(assetType, account);
            } else {
                // redis也没有就重新生成
                account = await this.__initAccount(chainName, assetType);
            }
            return account;
        }
    }

    // /**
    //  * 初始化账户
    //  * @returns
    //  */
    private async __initAccount(chainName: ExternalChainName, assetType: string) {
        const assetMap = this.__externalkeypairMap.forceGet(chainName);
        const serverKeypair = await this.getServerKeypair();
        const clientPublicKey = process.env["clientPublicKey"] as string;
        const keyName = this.__getAccountKey(chainName, assetType);
        // redis也没有就重新生成
        const secret = bip39.generateMnemonic();
        // 加密之后再存入redis中
        const result = bfmetaSignUtil.asymmetricEncrypt(
            new Uint8Array(Buffer.from(secret)),
            new Uint8Array(Buffer.from(clientPublicKey, "hex")),
            serverKeypair.secretKey,
        );

        // 这个值存到redis
        await this.setKeyValue(GLOBAL_VALUE_ENTITY_ID.ACCOUNT, keyName, Buffer.from(result.encryptedMessage).toString("base64"));
        const account = await this.__transformAccount(chainName, secret);
        assetMap.set(assetType, account);
        return account;
    }

    async getInjectExternalAddressObj(): Promise<{ [chainName: string]: { [assetType: string]: string } }> {
        if (process.env["workerName"] !== `${WORKER.ORDER}`) {
            return await ipcHelpers.request(`${WORKER.ORDER}`, CMD.GET_INJECT_EXTERNAL_ADDRESS, {});
        }
        const addressObj: { [chainName: string]: { [assetType: string]: string } } = {};
        for (const [chainName, info] of this.__externalkeypairMap) {
            addressObj[chainName] = addressObj[chainName] ?? {};
            for (const [assetType, account] of info) {
                addressObj[chainName][assetType] = account.address;
            }
        }
        return addressObj;
    }

    /**
     * 获取注入的外链地址
     * @param walletChain
     * @param walletAsset
     * @returns
     */
    async getInjectExternalAddress(walletChain: ExternalChainName, walletAsset: string) {
        const addressObj = await this.getInjectExternalAddressObj();
        if (!addressObj[walletChain] || !addressObj[walletChain][walletAsset]) {
            throw Error(`walletChain:${walletChain} walletAsset:${walletAsset} is not inject`);
        }
        return addressObj[walletChain][walletAsset];
    }
}
