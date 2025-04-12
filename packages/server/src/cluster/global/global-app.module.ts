import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "../../common";
import { GlobalApp } from "./global.app";
import { CronModule } from "../../cron/cron.module";
import { RedisModule } from "../../module/redis/redis.module";
import { AdminModule } from "../../module/admin/admin.module";
import { UpgradeModule } from "../../module/upgrade/upgrade.module";
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
