import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { mysqlConfig } from "../../common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CronModule } from "../../cron/cron.module";
import { MemoryModule } from "../../module/memory/memory.module";
import { RechargeModule } from "../../module/recharge/recharge.module";
import { RedisModule } from "../../module/redis/redis.module";
import { RedemptionModule } from "../../module/redemption/redemption.module";
import { AdminModule } from "../../module/admin/admin.module";
import { OrderApp } from "./order.app";
import { HttpRequestMiddleware, RedisBaseModule } from "@bnqkl/wallet-sdk";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), RedisBaseModule, RedisModule, CronModule, MemoryModule, RechargeModule, RedemptionModule, AdminModule],
    controllers: [],
    providers: [OrderApp],
})
export class OrderAppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpRequestMiddleware).forRoutes("*");
    }
}
