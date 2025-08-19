import { WalletConsumer } from "@bnqkl/wallet-sdk";
import { staticConfig } from "../config/index.js";
const { rabbitMQ } = staticConfig;

export const walletConsumer = new WalletConsumer(rabbitMQ.server);
