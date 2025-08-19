import { CHAIN_NETWORK_TYPE, ExternalChainHelper, InternalChainHelper, TransactionMaker, WalletSDK, WalletServerSDK } from "@bnqkl/wallet-sdk";
import { staticConfig } from "../config/index.js";

export const walletServerSdk = new WalletServerSDK(staticConfig.wallet.ip, staticConfig.wallet.port);
export const walletSdk = new WalletSDK(staticConfig.chainConfig.chainNetworkType === CHAIN_NETWORK_TYPE.TESTNET ? "c" : "b", staticConfig.chainConfig.chain);
export const bfmetaSignUtil = walletSdk.bfmetaSignUtil;
export const externalChainHelper = new ExternalChainHelper(walletSdk);
export const internalChainHelper = new InternalChainHelper(walletSdk);
export const transactionMaker = new TransactionMaker(staticConfig.chainConfig.transactionMakerPort);
