import { TransApi } from "./trans.api";
import * as ethers from "ethers";
import { $asyncAllNoNullMap, $asyncNoNullMap, ExternalTransType, Logger, NetWorkHelper, walletSdk } from "@cot/server";

export class ExternalTransferApi {
    /**
     * 解析eth账户信息
     * @param account
     */
    static parseEthAccount(account: COTServerTest.ExternalTransferArgs["account"]) {
        let privateKey = account.privateKey;
        if (!privateKey) {
            if (!account.mnemonic) {
                throw Error(`account.mnemonic is undefined`);
            }
            const wallet = ethers.Wallet.fromPhrase(account.mnemonic);
            privateKey = wallet.privateKey;
        }
        const { address } = walletSdk.walletFactory.BscApi.web3.eth.accounts.privateKeyToAccount(privateKey);
        return { privateKey, from: address };
    }

    /**
     * eth单笔合约转账
     * @param arg
     * @param network
     * @param ethTransPrepResDto
     * @returns
     */
    static async ethTransfer(arg: COTServerTest.ExternalTransferArgs, network: NetWorkHelper, ethTransPrepResDto?: WalletTypings.Eth.Api.EthTransPrepResDto) {
        const { account, to, contractAddress, amount } = arg;
        const { privateKey, from } = this.parseEthAccount(account);
        const { gasPrice, txCount, generalGas, contractGas } = ethTransPrepResDto
            ? ethTransPrepResDto
            : await TransApi.getEthTransPrep(
                  {
                      from,
                      to,
                      amount,
                      type: contractAddress ? ExternalTransType.CONTRACT : ExternalTransType.COMMON,
                      contractAddress,
                  },
                  network,
              );
        Logger.debug(`gasPrice:${gasPrice}, txCount:${txCount}, generalGas:${generalGas}, contractGas:${contractGas}`);
        const signTransData = await TransApi.signEthTransaction(
            {
                trans: {
                    from,
                    to: contractAddress ?? to,
                    nonce: txCount,
                    value: contractAddress ? "0" : amount,
                    gasPrice,
                    gas: contractAddress ? contractGas : generalGas,
                    chainId: await TransApi.getEthChainId(network),
                    data: contractAddress
                        ? await TransApi.getEthContractTransData(
                              {
                                  from,
                                  to,
                                  amount,
                                  contractAddress,
                              },
                              network,
                          )
                        : undefined,
                },
                privateKey,
            },
            network,
        );
        Logger.debug(`signTransData:${JSON.stringify(signTransData, null, 2)} nonce:${txCount} gasPrice:${gasPrice} to:${to} value:${amount}`);
        return signTransData;
    }

    /**
     * eth多笔合约转账
     * @param arg
     * @param transferNum
     * @param network
     * @returns
     */
    static async ethMultiTransfer(arg: COTServerTest.ExternalTransferArgs, transferNum: number, network: NetWorkHelper) {
        const { account, to, contractAddress, amount } = arg;
        const { from } = this.parseEthAccount(account);
        const ethTransPrepResDto = await TransApi.getEthTransPrep(
            {
                from,
                to,
                amount,
                type: contractAddress ? ExternalTransType.CONTRACT : ExternalTransType.COMMON,
                contractAddress,
            },
            network,
        );
        const params: WalletTypings.Eth.Api.EthTransPrepResDto[] = [];
        for (let i = 0; i < transferNum; i++) {
            params.push({ ...ethTransPrepResDto, txCount: ethTransPrepResDto.txCount + i });
        }
        return await $asyncAllNoNullMap(params, async (param) => {
            return await this.ethTransfer(arg, network, param);
        });
    }

    /**
     * bsc单笔合约转账
     * @param arg
     * @param network
     * @param COTServer.ExternalChain.EthTransPrepReq
     * @returns
     */
    static async bscTransfer(arg: COTServerTest.ExternalTransferArgs, network: NetWorkHelper, bscTransPrepResDto?: WalletTypings.Eth.Api.EthTransPrepResDto) {
        const { account, to, contractAddress, amount } = arg;
        const { privateKey, from } = this.parseEthAccount(account);
        const { gasPrice, txCount, generalGas, contractGas } = bscTransPrepResDto
            ? bscTransPrepResDto
            : await TransApi.getBscTransPrep(
                  {
                      from,
                      to,
                      amount,
                      type: contractAddress ? ExternalTransType.CONTRACT : ExternalTransType.COMMON,
                      contractAddress,
                  },
                  network,
              );
        Logger.debug(`gasPrice:${gasPrice}, txCount:${txCount}, generalGas:${generalGas}, contractGas:${contractGas}`);
        const signTransData = await TransApi.signBscTransaction(
            {
                trans: {
                    from,
                    to: contractAddress ?? to,
                    nonce: txCount,
                    value: contractAddress ? "0" : amount,
                    gasPrice,
                    gas: contractAddress ? contractGas : generalGas,
                    chainId: await TransApi.getBscChainId(network),
                    data: contractAddress
                        ? await TransApi.getBscContractTransData(
                              {
                                  from,
                                  to,
                                  amount,
                                  contractAddress,
                              },
                              network,
                          )
                        : undefined,
                },
                privateKey,
            },
            network,
        );
        Logger.debug(`signTransData:${JSON.stringify(signTransData, null, 2)} nonce:${txCount} gasPrice:${gasPrice} to:${to} value:${amount}`);
        return signTransData;
    }

    /**
     * bsc多笔合约转账
     * @param arg
     * @param transferNum
     * @param network
     * @returns
     */
    static async bscMultiTransfer(arg: COTServerTest.ExternalTransferArgs, transferNum: number, network: NetWorkHelper) {
        const { account, to, contractAddress, amount } = arg;
        const { from } = this.parseEthAccount(account);
        const bscTransPrepResDto = await TransApi.getBscTransPrep(
            {
                from,
                to,
                amount,
                type: contractAddress ? ExternalTransType.CONTRACT : ExternalTransType.COMMON,
                contractAddress,
            },
            network,
        );
        const params: WalletTypings.Eth.Api.EthTransPrepResDto[] = [];
        for (let i = 0; i < transferNum; i++) {
            params.push({ ...bscTransPrepResDto, txCount: bscTransPrepResDto.txCount + i });
        }
        return await $asyncAllNoNullMap(params, async (param) => {
            return await this.bscTransfer(arg, network, param);
        });
    }

    /**
     * tron单笔合约转账
     * @param arg
     * @param network
     * @returns
     */
    static async trc20Transfer(arg: COTServerTest.ExternalTransferArgs, network: NetWorkHelper) {
        const tronApi = walletSdk.walletFactory.TronApi;
        const { account, to, contractAddress, amount } = arg;
        if (!account.mnemonic) {
            throw Error(`account.mnemonic is undefined`);
        }
        if (!contractAddress) {
            throw Error(`trc20Transfer is not support mainAsset`);
        }
        const { privateKey, publicKey, address } = await tronApi.recoverAccount(account.mnemonic);
        const from = await tronApi.addressToHex(address);
        // console.log(`privateKey ${privateKey}`);
        // console.log(`publicKey ${publicKey}`);
        console.log(`address ${address}`);
        // console.log(`addressHex ${from}`);
        const trc20Trans: BFChainWallet.TRON.Trc20Transaction = await TransApi.createTronContractTrans(
            {
                from: address,
                to,
                amount,
                contractAddress,
            },
            network,
        );
        const signTrc20Trans: BFChainWallet.TRON.Trc20Transaction = await tronApi.signTrc20(trc20Trans, privateKey.substring(2));
        return signTrc20Trans;
    }
    /**
     * tron单笔合约转账
     * @param arg
     * @param network
     * @returns
     */
    static async trxTransfer(arg: COTServerTest.ExternalTransferArgs, network: NetWorkHelper) {
        const tronApi = walletSdk.walletFactory.TronApi;
        const { account, to, contractAddress, amount } = arg;
        if (!account.mnemonic) {
            throw Error(`account.mnemonic is undefined`);
        }
        const { privateKey, publicKey, address } = await tronApi.recoverAccount(account.mnemonic);
        const from = await tronApi.addressToHex(address);
        // console.log(`privateKey ${privateKey}`);
        // console.log(`publicKey ${publicKey}`);
        console.log(`address ${address}`);
        // console.log(`addressHex ${from}`);
        const trc20Trans: BFChainWallet.TRON.TronTransaction = await TransApi.createTronNormalTrans(
            {
                from: address,
                to,
                amount,
            },
            network,
        );
        const signTrxTrans: BFChainWallet.TRON.TronTransaction = await tronApi.signTrx(trc20Trans, privateKey.substring(2));
        return signTrxTrans;
    }

    /**
     * tron多笔合约转账
     * @param arg
     * @param transferNum
     * @param network
     * @returns
     */
    static async trc20MultiTransfer(arg: COTServerTest.ExternalTransferArgs, transferNum: number, network: NetWorkHelper) {
        const params: number[] = [];
        for (let i = 0; i < transferNum; i++) {
            params.push(i);
        }
        return await $asyncNoNullMap(params, async () => {
            return await this.trc20Transfer(arg, network);
        });
    }
}
