import { forwardRef, Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module.js";
import { UpgradeService } from "./upgrade.service.js";

@Module({
    imports: [forwardRef(() => RedisModule)],
    providers: [UpgradeService],
    exports: [UpgradeService],
})
export class UpgradeModule {
    constructor() {}
}
