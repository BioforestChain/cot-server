import { Module } from "@nestjs/common";
import { RedisModule } from "../../redis/redis.module.js";
import { MemoryModule } from "../../memory/memory.module.js";
import { ConfigController } from "./config.controller.js";
import { ConfigService } from "./config.service.js";

@Module({
    imports: [RedisModule, MemoryModule],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
