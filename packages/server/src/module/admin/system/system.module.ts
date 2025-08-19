import { forwardRef, Module } from "@nestjs/common";
import { SystemController } from "./system.controller.js";
import { SystemService } from "./system.service.js";
import { RedisBaseModule } from "@bnqkl/wallet-sdk";

@Module({
    imports: [forwardRef(() => RedisBaseModule)],
    controllers: [SystemController],
    providers: [SystemService],
    exports: [SystemService],
})
export class SystemModule {}
