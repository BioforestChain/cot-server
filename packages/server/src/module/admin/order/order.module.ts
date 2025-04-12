import { forwardRef, Module } from "@nestjs/common";
import { RechargeModule } from "../../recharge/recharge.module";
import { RechargeOrderRepository } from "../../recharge/recharge.repository";
import { RedemptionModule } from "../../redemption/redemption.module";
import { RedemptionOrderRepository } from "../../redemption/redemption.repository";
import { UserModule } from "../user/user.module";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
    imports: [RechargeModule, RedemptionModule, forwardRef(() => UserModule)],
    controllers: [OrderController],
    providers: [OrderService, RechargeOrderRepository, RedemptionOrderRepository],
    exports: [OrderService],
})
export class OrderModule {}
