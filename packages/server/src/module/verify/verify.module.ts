import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "../../module/redis/redis.module";
import { MemoryModule } from "../memory/memory.module";
import { VerifyController } from "./verify.controller";

@Module({
    imports: [JwtModule, forwardRef(() => MemoryModule), forwardRef(() => RedisModule)],
    controllers: [VerifyController],
    providers: [],
    exports: [],
})
export class VerifyModule {}
