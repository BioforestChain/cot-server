import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { mysqlConfig } from "@bnqkl/cot-server";
import { RechargeTestModule } from "./recharge/recharge-test.module.js";
import { RedemptionTestModule } from "./redemption/redemption-test.module.js";
import { TestApp } from "./test.app.js";
import { TransTestModule } from "./trans/trans-test.module.js";

@Module({
    imports: [TypeOrmModule.forRootAsync(mysqlConfig), TransTestModule, RechargeTestModule, RedemptionTestModule],
    controllers: [],
    providers: [TestApp],
})
export class TestModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
