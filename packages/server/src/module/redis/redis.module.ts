import { Module, forwardRef } from "@nestjs/common";
import { GlobalValueRedisRepository } from "./global-value.redis-repository";

@Module({
    imports: [],
    providers: [GlobalValueRedisRepository],
    exports: [GlobalValueRedisRepository],
})
export class RedisModule {}
