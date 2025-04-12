import { forwardRef, Module } from "@nestjs/common";
import { RedemptionController } from "./redemption.controller";
import { RedemptionOrderRepository } from "./redemption.repository";
import { RedemptionService } from "./redemption.service";
import { MemoryModule } from "../memory/memory.module";
import { RedisModule } from "../redis/redis.module";
import { RedemptionOrderMgr } from "./order/redemption-order-mgr";
import {
    ExternalOnChainFail_RedemptionOrderState,
    ExternalWaitOnChain_RedemptionOrderState,
    InternalOnChainFail_RedemptionOrderState,
    InternalWaitOnChain_RedemptionOrderState,
    Success_RedemptionOrderState,
} from "./order/state";

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
