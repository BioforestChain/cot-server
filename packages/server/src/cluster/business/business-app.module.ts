import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { mysqlConfig } from "../../common/index.js";
import { BusinessApp } from "./business.app.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CronModule } from "../../cron/cron.module.js";
import { MemoryModule } from "../../module/memory/memory.module.js";
import { RedisModule } from "../../module/redis/redis.module.js";
import { AdminModule } from "../../module/admin/admin.module.js";
import { RechargeModule } from "../../module/recharge/recharge.module.js";
import { RedemptionModule } from "../../module/redemption/redemption.module.js";
import { HttpRequestMiddleware, RedisBaseModule } from "@bnqkl/wallet-sdk";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), RedisBaseModule, RedisModule, CronModule, MemoryModule, RechargeModule, RedemptionModule, AdminModule],
    controllers: [],
    providers: [BusinessApp],
})
export class BusinessAppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpRequestMiddleware).forRoutes("*");
    }
}
