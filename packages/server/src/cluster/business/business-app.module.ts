import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { mysqlConfig } from "../../common";
import { BusinessApp } from "./business.app";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CronModule } from "../../cron/cron.module";
import { MemoryModule } from "../../module/memory/memory.module";
import { RedisModule } from "../../module/redis/redis.module";
import { AdminModule } from "../../module/admin/admin.module";
import { RechargeModule } from "../../module/recharge/recharge.module";
import { RedemptionModule } from "../../module/redemption/redemption.module";
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
