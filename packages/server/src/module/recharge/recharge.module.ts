import { forwardRef, Module } from "@nestjs/common";
import { RechargeController } from "./recharge.controller.js";
import { RechargeOrderRepository } from "./recharge.repository.js";
import { RechargeService } from "./recharge.service.js";
import { MemoryModule } from "../memory/memory.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { RechargeOrderMgr } from "./order/recharge-order-mgr.js";
import {
    ExternalOnChainFail_RechargeOrderState,
    ExternalWaitOnChain_RechargeOrderState,
    InternalOnChainFail_RechargeOrderState,
    InternalWaitOnChain_RechargeOrderState,
    Success_RechargeOrderState,
} from "./order/state/index.js";

@Module({
    imports: [forwardRef(() => MemoryModule), forwardRef(() => RedisModule)],
    controllers: [RechargeController],
    providers: [
        RechargeService,
        RechargeOrderRepository,
        RechargeOrderMgr,
        ExternalWaitOnChain_RechargeOrderState,
        ExternalOnChainFail_RechargeOrderState,
        InternalWaitOnChain_RechargeOrderState,
        InternalOnChainFail_RechargeOrderState,
        Success_RechargeOrderState,
    ],
    exports: [RechargeService, RechargeOrderMgr],
})
export class RechargeModule {}
