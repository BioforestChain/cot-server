import { NestFactory } from "@nestjs/core";
import { Logger } from "@bnqkl/wallet-sdk";
import { staticConfig } from "../../config";
import { BaseWorker } from "../worker";
import { OrderAppModule } from "./order-app.module";
import { NestExpressApplication } from "@nestjs/platform-express";

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

class OrderWorker extends BaseWorker {
    async start() {
        const app = await NestFactory.create<NestExpressApplication>(OrderAppModule);
        await this.initAppModule(app);
    }

    getHttpPort() {
        return staticConfig.ports.order;
    }
}

(async () => {
    try {
        const worker = new OrderWorker();
        await worker.start();
    } catch (err) {
        Logger.error(err);
    }
})();
