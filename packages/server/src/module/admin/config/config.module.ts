import { Module } from "@nestjs/common";
import { RedisModule } from "../../redis/redis.module";
import { MemoryModule } from "../../memory/memory.module";
import { ConfigController } from "./config.controller";
import { ConfigService } from "./config.service";

@Module({
    imports: [RedisModule, MemoryModule],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
