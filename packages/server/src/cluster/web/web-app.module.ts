import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { mysqlConfig } from "../../common/index.js";
import { WebApp } from "./web.app.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RechargeModule } from "../../module/recharge/recharge.module.js";
import { VerifyModule } from "../../module/verify/verify.module.js";
import { RedisModule } from "../../module/redis/redis.module.js";
import { RedemptionModule } from "../../module/redemption/redemption.module.js";
import { AdminModule } from "../../module/admin/admin.module.js";
import { HttpRequestMiddleware, RedisBaseModule } from "@bnqkl/wallet-sdk";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), RedisBaseModule, RedisModule, RechargeModule, VerifyModule, RedemptionModule, AdminModule],
    providers: [WebApp],
})
export class WebAppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpRequestMiddleware).forRoutes("*");
    }
}
