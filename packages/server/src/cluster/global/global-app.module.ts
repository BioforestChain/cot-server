import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "../../common/index.js";
import { GlobalApp } from "./global.app.js";
import { CronModule } from "../../cron/cron.module.js";
import { RedisModule } from "../../module/redis/redis.module.js";
import { AdminModule } from "../../module/admin/admin.module.js";
import { UpgradeModule } from "../../module/upgrade/upgrade.module.js";
import { HttpRequestMiddleware, RedisBaseModule } from "@bnqkl/wallet-sdk";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), RedisBaseModule, RedisModule, CronModule, UpgradeModule, AdminModule],
    controllers: [],
    providers: [GlobalApp],
})
export class GlobalAppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpRequestMiddleware).forRoutes("*");
    }
}
