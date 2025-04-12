import { Module, forwardRef } from "@nestjs/common";
import { RedisModule } from "../module/redis/redis.module";
import { GlobalCronMgr } from "./global-cron.mgr";

@Module({
    imports: [forwardRef(() => RedisModule)],
    providers: [GlobalCronMgr],
    exports: [GlobalCronMgr],
})
export class CronModule {}
