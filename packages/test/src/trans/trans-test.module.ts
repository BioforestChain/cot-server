import { forwardRef, Module } from "@nestjs/common";
import { TransApiTest } from "./trans-api.test.js";

@Module({
    imports: [],
    providers: [TransApiTest],
    exports: [TransApiTest],
})
export class TransTestModule {}
