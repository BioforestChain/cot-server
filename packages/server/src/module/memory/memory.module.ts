import { forwardRef, Module } from "@nestjs/common";
import { MemoryService } from "./memory.service.js";

@Module({
    imports: [],
    providers: [MemoryService],
    exports: [MemoryService],
})
export class MemoryModule {}
