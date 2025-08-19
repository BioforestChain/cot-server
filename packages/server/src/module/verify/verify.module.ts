import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "../../module/redis/redis.module.js";
import { MemoryModule } from "../memory/memory.module.js";
import { VerifyController } from "./verify.controller.js";

@Module({
    imports: [JwtModule, forwardRef(() => MemoryModule), forwardRef(() => RedisModule)],
    controllers: [VerifyController],
    providers: [],
    exports: [],
})
export class VerifyModule {}
