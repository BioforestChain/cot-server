import { StaticConfigFactory } from "@bnqkl/wallet-sdk";
export const staticConfigFactory = new StaticConfigFactory<COTServer.Config.CustomerConfig>();
export const staticConfig = staticConfigFactory.getConfig();
