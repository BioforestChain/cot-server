import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { mysqlConfig } from "../../common";
import { WebApp } from "./web.app";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RechargeModule } from "../../module/recharge/recharge.module";
import { VerifyModule } from "../../module/verify/verify.module";
import { RedisModule } from "../../module/redis/redis.module";
import { RedemptionModule } from "../../module/redemption/redemption.module";
import { AdminModule } from "../../module/admin/admin.module";
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
