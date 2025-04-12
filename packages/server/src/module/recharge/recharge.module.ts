import { forwardRef, Module } from "@nestjs/common";
import { RechargeController } from "./recharge.controller";
import { RechargeOrderRepository } from "./recharge.repository";
import { RechargeService } from "./recharge.service";
import { MemoryModule } from "../memory/memory.module";
import { RedisModule } from "../redis/redis.module";
import { RechargeOrderMgr } from "./order/recharge-order-mgr";
import {
    ExternalOnChainFail_RechargeOrderState,
    ExternalWaitOnChain_RechargeOrderState,
    InternalOnChainFail_RechargeOrderState,
    InternalWaitOnChain_RechargeOrderState,
    Success_RechargeOrderState,
} from "./order/state";

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
