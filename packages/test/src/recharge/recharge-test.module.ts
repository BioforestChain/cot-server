import { Module } from "@nestjs/common";
import { RechargeApiTest } from "./recharge-api.test.js";

@Module({
    imports: [],
    providers: [RechargeApiTest],
    exports: [RechargeApiTest],
})
export class RechargeTestModule {}
