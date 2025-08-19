import { forwardRef, Inject, OnModuleInit } from "@nestjs/common";
import { RechargeApiTest } from "./recharge/recharge-api.test.js";
import { RedemptionApiTest } from "./redemption/redemption-api.test.js";
import { TransApiTest } from "./trans/trans-api.test.js";
export class TestApp implements OnModuleInit {
    @Inject(forwardRef(() => TransApiTest))
    private __transApiTest!: TransApiTest;
    @Inject(forwardRef(() => RechargeApiTest))
    private __rechargeApiTest!: RechargeApiTest;
    @Inject(forwardRef(() => RedemptionApiTest))
    private __redemptionApiTest!: RedemptionApiTest;

    async onModuleInit() {
        const flag = process.argv[2];
        let exit = true;
        switch (flag) {
            case "--recharge":
                await this.__rechargeApiTest.execute();
                break;
            case "--redemption":
                await this.__redemptionApiTest.execute();
                break;
            default:
                await this.__transApiTest.execute();
                break;
        }
        console.info(`test success!`);
        if (exit) {
            process.exit(0);
        }
    }
}
