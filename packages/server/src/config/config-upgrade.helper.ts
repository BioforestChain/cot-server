import { Logger } from "@bnqkl/wallet-sdk";
import { staticConfig, staticConfigFactory } from "./static-config.js";

/** 版本信息 */
export interface VersionInfo {
    /**版本号 */
    version: number;
    /**版本信息 */
    info: string;
}
/** 版本信息数组 */
export interface VersionArray {
    versionInfo: VersionInfo;
    method: string;
}

export class ConfigUpgradeHelper {
    // 将版本往下累加
    private static __versionsArray: VersionArray[] = [
        {
            versionInfo: {
                version: 1,
                info: "初始化构建配置文件",
            },
            method: "initConfig",
        },
        {
            versionInfo: {
                version: 2,
                info: "更新钱包的host配置",
            },
            method: "updateConfigHost",
        },
        {
            versionInfo: {
                version: 3,
                info: "wallet独立为服务",
            },
            method: "independenceWallet",
        },
    ];

    static upgrade() {
        let version = staticConfig.version;
        Logger.info(`current config version: ${version}`);
        for (const { versionInfo, method } of this.__versionsArray) {
            if (version === undefined || version < versionInfo.version) {
                Logger.info(`配置文件当前版本号为 ${version}, 正在更新 ${versionInfo.version}`);
                if (!(this as any)[method]) {
                    const msg = `没有找到更新函数 ${method}`;
                    Logger.warn(msg);
                    throw msg;
                }
                (this as any)[method]();
                // 更新配置文件
                version = staticConfig.version = versionInfo.version;
                staticConfigFactory.setConfig(staticConfig, true);
            }
        }
    }

    static initConfig() {}

    static updateConfigHost() {
        // const update = (config: any) => {
        //     if (config) {
        //         const ips = config.ips;
        //         if (ips) {
        //             const port = config.port;
        //             const host: BFChainWallet.HostType[] = [];
        //             for (const ip of ips) {
        //                 host.push({ ip, port });
        //             }
        //             config.host = host;
        //         }
        //     }
        // };
        // update(staticConfig.chainConfig.chain.bfchain);
        // update(staticConfig.chainConfig.chain.ccchain);
        // update(staticConfig.chainConfig.chain.bfm);
        // update(staticConfig.chainConfig.chain.pmchain);
        // update(staticConfig.chainConfig.chain.eth);
        // update(staticConfig.chainConfig.chain.tron);
        // update(staticConfig.chainConfig.chain.bsc);
    }

    static independenceWallet() {
        staticConfig.coreForProcess = { coreNumForWebServer: 3 };
        staticConfig.wallet = { ip: "localhost", port: 6055 };
        staticConfig.ports = {
            web: staticConfig.ports.web,
            global: staticConfig.ports.global,
            business: (staticConfig.ports as any).trans ?? staticConfig.ports.business,
            order: 5059,
        };
    }
}
