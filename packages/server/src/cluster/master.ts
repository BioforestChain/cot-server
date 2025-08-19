import { gipcSetup } from "@bnqkl/ipc";
import * as path from "path";
import type { OnModuleInit } from "@nestjs/common";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { staticConfig, ConfigUpgradeHelper } from "../config/index.js";
import { WORKER } from "../common/index.js";
import { Logger, redisCore, CommonMaster, GLOBAL_INITING } from "@bnqkl/wallet-sdk";
import { UpgradeService } from "../module/upgrade/upgrade.service.js";

process.on("uncaughtException", (err) => {
    // tslint:disable-next-line: no-empty
    if (
        err &&
        (err.message === "read ECONNRESET" ||
            err.message === "Channel closed" ||
            err.message === "write EPIPE" ||
            err.message === "This socket has been ended by the other party") /**临时加上这个以防止输出过量错误日志，无法看到之前的日志 */
    ) {
    } else {
        Logger.error(err);
        Logger.error(`uncaughtException ${process.env["workerName"]}`);
    }
});
process.on("unhandledRejection", (err) => {
    Logger.warn(err);
});

@Injectable()
export class Master extends CommonMaster implements OnModuleInit {
    @Inject(forwardRef(() => UpgradeService))
    private __upgradeService!: UpgradeService;

    async onModuleInit() {
        gipcSetup();
        //先更新配置文件
        ConfigUpgradeHelper.upgrade();
        await redisCore.connect(staticConfig.redis.server);
        // 先启动全局进程，进行集群初始化，后续检测集群初始化成功后，再创建进程
        await redisCore.redis.set(GLOBAL_INITING, "true");
        this.forkWorker(path.resolve(__dirname, "./global/global.worker"), `${WORKER.GLOBAL}`);
        await this.waitInitDone();
        this.onMessage();

        // 启动WEB服务进程
        for (let i = 1; i <= staticConfig.coreForProcess.coreNumForWebServer; i++) {
            this.forkWorker(path.resolve(__dirname, "./web/web.worker"), `${WORKER.WEB}_${i}`);
        }

        // 启动订单处理进程
        this.forkWorker(path.resolve(__dirname, "./order/order.worker"), `${WORKER.ORDER}`);

        // 启动业务处理进程
        this.forkWorker(path.resolve(__dirname, "./business/business.worker"), `${WORKER.BUSINESS}`);
    }

    async waitInitDone() {
        Logger.info("wait cluster init...");
        await this.__upgradeService.waitUpgradeDone();
        await this.waitGlobalInited();
        Logger.info("cluster init success!");
    }
}
