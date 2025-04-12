export {};
declare global {
    export namespace COTServer {
        export namespace Config {
            /** 所有配置信息 */
            export interface CustomerConfig extends WalletServerSdk.Config.CustomerConfig {
                coreForProcess: {
                    /**WebServer的数量 */
                    coreNumForWebServer: number;
                };
                ports: {
                    web: number;
                    business: number;
                    global: number;
                    order: number;
                };
                wallet: {
                    ip: string;
                    port: number;
                };
                apiLimit: CoreAPILimitConfig;
                test: {
                    serverIp?: string;
                    port?: number;
                    rechargeNum?: number;
                };
                docs: boolean;
            }

            export interface CoreAPILimitConfig {
                limitInterval: number;
                maxRequest: number;
                whiteList: string[];
            }
        }

        export namespace Upgrade {
            export type MysqlUpdateList = {
                /**版本号 */
                version: string;
                /**更新描述 */
                describe: string;
                /**执行的sql文件名 */
                fileName: string;
            }[];

            export type PatchVersionArray = {
                /**版本号 */
                version: string;
                /**更新描述 */
                describe: string;
                /**执行的函数名 */
                method: string;
            };
        }
    }
}
