import { forwardRef, Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { UpgradeService } from "./upgrade.service";

@Module({
    imports: [forwardRef(() => RedisModule)],
    providers: [UpgradeService],
    exports: [UpgradeService],
})
export class UpgradeModule {
    constructor() {}
}
