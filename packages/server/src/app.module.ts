import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { Master } from "./cluster/master";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "./common";
import { UpgradeModule } from "./module/upgrade/upgrade.module";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), UpgradeModule],
    controllers: [],
    providers: [Master],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
