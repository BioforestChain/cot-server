import { staticConfig } from "../config/index.js";
import { CommonApp, rabbitMQCore, redisCore } from "@bnqkl/wallet-sdk";

export abstract class BaseApp extends CommonApp {
    async start() {
        await this.initIpc();
        // 移到initAppModule里，更早的时候就会连接redis
        // await this.connectRedis();
    }

    async connectRedis() {
        await redisCore.connect(staticConfig.redis.server);
    }

    async connectMq() {
        await rabbitMQCore.getConnection(staticConfig.rabbitMQ.server);
    }
}
