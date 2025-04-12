import { Controller, forwardRef, Get, Inject, Query, Post, Body } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { AdminAuthorization } from "../../../common";
import {
    FixRechargeOrderReqDto,
    FixRedemptionOrderReqDto,
    GetExternalTransReqDto,
    GetInternalTransReqDto,
    GetOrderDetailReqDto,
    GetRechargeOrdersReqDto,
    GetRedemptionOrdersReqDto,
} from "../dto/order.dto";
import { Logger } from "@bnqkl/wallet-sdk";
import { walletServerSdk } from "../../../helper/wallet-server-sdk";
import { UserService } from "../user/user.service";

@ApiTags("ADMIN/ORDER")
@Controller("admin/order")
export class OrderController {
    @Inject(forwardRef(() => OrderService))
    private __orderService!: OrderService;
    @Inject(forwardRef(() => UserService))
    private __userService!: UserService;

    /**
     * 充值订单
     */
    /**
     * 查询充值订单
     */
    @Post("recharge/list")
    @ApiOperation({ summary: "充值订单列表查询" })
    getRechargeOrders(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetRechargeOrdersReqDto) {
        return this.__orderService.getRechargeOrders(dto);
    }
    /**
     * 查询充值订单详情
     */
    @Post("recharge/detail")
    @ApiOperation({ summary: "充值订单明细查询" })
    getRechargeOrderDetail(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetOrderDetailReqDto) {
        return this.__orderService.getRechargeOrderDetail(dto.entityId);
    }
    /**
     * 修复充值订单
     */
    @Post("recharge/fix")
    @ApiOperation({ summary: "充值订单重试" })
    async fixRechargeOrder(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: FixRechargeOrderReqDto) {
        const operateRecord = await this.__userService.saveOperateRecord({
            loginName: authorization.loginName,
            api: "recharge/fix",
            data: JSON.stringify(dto),
        });
        Logger.debug(`${authorization.loginName} 操作了 recharge/fix ${JSON.stringify(dto)}`);
        const result = await this.__orderService.fixRechargeOrder(dto);
        await this.__userService.operateRecordSuccess(operateRecord);
        return result;
    }
    /**
     * 赎回订单
     */
    /**
     * 查询赎回订单
     */
    @Post("redemption/list")
    @ApiOperation({ summary: "赎回订单列表查询" })
    getRedemptionOrders(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetRedemptionOrdersReqDto) {
        return this.__orderService.getRedemptionOrders(dto);
    }
    /**
     * 查询赎回订单详情
     */
    @Post("redemption/detail")
    @ApiOperation({ summary: "赎回订单明细查询" })
    getRedemptionOrderDetail(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetOrderDetailReqDto) {
        return this.__orderService.getRedemptionOrderDetail(dto.entityId);
    }
    /**
     * 修复赎回订单
     */
    @Post("redemption/fix")
    @ApiOperation({ summary: "赎回订单重试" })
    async fixRedemptionOrder(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: FixRedemptionOrderReqDto) {
        const operateRecord = await this.__userService.saveOperateRecord({
            loginName: authorization.loginName,
            api: "redemption/fix",
            data: JSON.stringify(dto),
        });
        Logger.debug(`${authorization.loginName} 操作了 redemption/fix ${JSON.stringify(dto)}`);
        const result = await this.__orderService.fixRedemptionOrder(dto);
        await this.__userService.operateRecordSuccess(operateRecord);
        return result;
    }
    /**
     * 交易查询直接调用wallet
     */
    @Post("transaction/external/detail")
    @ApiOperation({ summary: "外链交易查询" })
    async getExternalTransactionDetail(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetExternalTransReqDto) {
        return await walletServerSdk.getExternalTrans(dto);
    }

    @Post("transaction/internal/detail")
    @ApiOperation({ summary: "内链交易查询" })
    async getInternalTransactionDetail(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetInternalTransReqDto) {
        return await walletServerSdk.getInternalTrans(dto);
    }
}
