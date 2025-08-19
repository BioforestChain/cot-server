import { Module, forwardRef } from "@nestjs/common";
import { RedisModule } from "../module/redis/redis.module.js";
import { GlobalCronMgr } from "./global-cron.mgr.js";

@Module({
    imports: [forwardRef(() => RedisModule)],
    providers: [GlobalCronMgr],
    exports: [GlobalCronMgr],
})
export class CronModule {}
