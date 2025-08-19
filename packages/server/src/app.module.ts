import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { Master } from "./cluster/master.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "./common/index.js";
import { UpgradeModule } from "./module/upgrade/upgrade.module.js";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), UpgradeModule],
    controllers: [],
    providers: [Master],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
