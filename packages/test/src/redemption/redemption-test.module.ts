import { Module } from "@nestjs/common";
import { RedemptionApiTest } from "./redemption-api.test";

@Module({
    imports: [],
    providers: [RedemptionApiTest],
    exports: [RedemptionApiTest],
})
export class RedemptionTestModule {}
