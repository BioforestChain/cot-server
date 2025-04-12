import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "@cot/server";
import { RechargeTestModule } from "./recharge/recharge-test.module";
import { RedemptionTestModule } from "./redemption/redemption-test.module";
import { TestApp } from "./test.app";
import { TransTestModule } from "./trans/trans-test.module";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), TransTestModule, RechargeTestModule, RedemptionTestModule],
    controllers: [],
    providers: [TestApp],
})
export class TestModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
