import { forwardRef, Module } from "@nestjs/common";
import { RedemptionController } from "./redemption.controller.js";
import { RedemptionOrderRepository } from "./redemption.repository.js";
import { RedemptionService } from "./redemption.service.js";
import { MemoryModule } from "../memory/memory.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { RedemptionOrderMgr } from "./order/redemption-order-mgr.js";
import {
    ExternalOnChainFail_RedemptionOrderState,
    ExternalWaitOnChain_RedemptionOrderState,
    InternalOnChainFail_RedemptionOrderState,
    InternalWaitOnChain_RedemptionOrderState,
    Success_RedemptionOrderState,
} from "./order/state/index.js";

@Module({
    imports: [forwardRef(() => MemoryModule), forwardRef(() => RedisModule)],
    controllers: [RedemptionController],
    providers: [
        RedemptionService,
        RedemptionOrderRepository,
        RedemptionOrderMgr,
        ExternalWaitOnChain_RedemptionOrderState,
        ExternalOnChainFail_RedemptionOrderState,
        InternalWaitOnChain_RedemptionOrderState,
        InternalOnChainFail_RedemptionOrderState,
        Success_RedemptionOrderState,
    ],
    exports: [RedemptionService, RedemptionOrderMgr],
})
export class RedemptionModule {}
