import { forwardRef, Module } from "@nestjs/common";
import { RechargeModule } from "../../recharge/recharge.module.js";
import { RechargeOrderRepository } from "../../recharge/recharge.repository.js";
import { RedemptionModule } from "../../redemption/redemption.module.js";
import { RedemptionOrderRepository } from "../../redemption/redemption.repository.js";
import { UserModule } from "../user/user.module.js";
import { OrderController } from "./order.controller.js";
import { OrderService } from "./order.service.js";

@Module({
    imports: [RechargeModule, RedemptionModule, forwardRef(() => UserModule)],
    controllers: [OrderController],
    providers: [OrderService, RechargeOrderRepository, RedemptionOrderRepository],
    exports: [OrderService],
})
export class OrderModule {}
