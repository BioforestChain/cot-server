import { rabbitMQCore } from "@bnqkl/wallet-sdk";
import { forwardRef, Inject, OnModuleInit } from "@nestjs/common";
import { RechargeOrderMgr } from "../../module/recharge/order/recharge-order-mgr";
import { RedemptionOrderMgr } from "../../module/redemption/order/redemption-order-mgr";
import { BaseApp } from "../app";

export class BusinessApp extends BaseApp implements OnModuleInit {
    @Inject(forwardRef(() => RechargeOrderMgr))
    private __rechargeOrderMgr!: RechargeOrderMgr;
    @Inject(forwardRef(() => RedemptionOrderMgr))
    private __redemptionOrderMgr!: RedemptionOrderMgr;

    async onModuleInit() {
        await this.start();
        // 处理mq任务
        await this.__processMqTask();
    }

    /**
     * 处理mq任务
     */
    private async __processMqTask() {
        rabbitMQCore.on("connect", () => {
            // 处理订单完成逻辑
            this.__rechargeOrderMgr.processOrderDone();
            this.__redemptionOrderMgr.processOrderDone();
        });
        // mq要等其他事件监听后再连接
        await this.connectMq();
    }

    async initIpc() {
        const server = await super.initIpc();
        /**注册函数 */
        return server;
    }
}
