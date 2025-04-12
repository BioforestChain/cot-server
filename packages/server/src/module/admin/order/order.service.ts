import { FIX_RECHARGE_ORDER_TYPE, FIX_REDEMPTION_ORDER_TYPE } from "@cot/core";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { FindOptionsWhere } from "typeorm";
import { RechargeOrder, RedemptionOrder } from "../../../common";
import { RechargeOrderRepository } from "../../recharge/recharge.repository";
import { RechargeService } from "../../recharge/recharge.service";
import { RedemptionOrderRepository } from "../../redemption/redemption.repository";
import { RedemptionService } from "../../redemption/redemption.service";

@Injectable()
export class OrderService {
    @Inject(forwardRef(() => RechargeOrderRepository))
    private __rechargeOrderRepository!: RechargeOrderRepository;
    @Inject(forwardRef(() => RedemptionOrderRepository))
    private __redemptionOrderRepository!: RedemptionOrderRepository;
    @Inject(forwardRef(() => RechargeService))
    private __rechargeService!: RechargeService;
    @Inject(forwardRef(() => RedemptionService))
    private __redemptionService!: RedemptionService;
    constructor() {}

    async getRechargeOrders(dto: COTCore.Api.Admin.Order.GetRechargeOrdersReqDto) {
        const { entityId, walletAddress, walletTxId, internalAddress, orderState, page, pageSize } = dto;

        const where: FindOptionsWhere<RechargeOrder> = {};
        if (entityId) {
            where.entityId = entityId;
        }
        if (walletAddress) {
            where.walletAddress = walletAddress;
        }
        if (walletTxId) {
            where.walletTxId = walletTxId;
        }
        if (internalAddress) {
            where.internalAddress = internalAddress;
        }
        if (orderState) {
            where.state = orderState as number;
        }
        const result = await this.__rechargeOrderRepository.findByPageNormal({ where, order: { id: "DESC" } }, page, pageSize);
        return result;
    }

    async getRechargeOrderDetail(entityId: string) {
        return await this.__rechargeOrderRepository.findOneForce({ where: { entityId } });
    }
    async fixRechargeOrder(dto: COTCore.Api.Admin.Order.FixRechargeOrderReqDto) {
        const { entityId, fixType } = dto;
        switch (fixType) {
            case FIX_RECHARGE_ORDER_TYPE.RETRY_EXTERNAL_ON_CHAIN:
                return await this.__rechargeService.retryExternalOnChain(entityId);
            case FIX_RECHARGE_ORDER_TYPE.RETRY_INTERNAL_ON_CHAIN:
                return await this.__rechargeService.retryInternalOnChain(entityId);
            default:
                throw new Error(`invaild ${fixType}`);
        }
    }
    async getRedemptionOrders(dto: COTCore.Api.Admin.Order.GetRedemptionOrdersReqDto) {
        const { entityId, internalAddress, redemptionTxId, walletAddress, walletTxId, orderState, page, pageSize } = dto;

        const where: FindOptionsWhere<RedemptionOrder> = {};
        if (entityId) {
            where.entityId = entityId;
        }
        if (walletAddress) {
            where.walletAddress = walletAddress;
        }
        if (redemptionTxId) {
            where.redemptionTxId = redemptionTxId;
        }
        if (walletTxId) {
            where.walletTxId = walletTxId;
        }
        if (internalAddress) {
            where.internalAddress = internalAddress;
        }
        if (orderState) {
            where.state = orderState as number;
        }
        const result = await this.__redemptionOrderRepository.findByPageNormal({ where, order: { id: "DESC" } }, page, pageSize);
        return result;
    }
    async getRedemptionOrderDetail(entityId: string) {
        return await this.__redemptionOrderRepository.findOneForce({ where: { entityId } });
    }
    async fixRedemptionOrder(dto: COTCore.Api.Admin.Order.FixRedemptionOrderReqDto) {
        const { entityId, fixType } = dto;
        switch (fixType) {
            case FIX_REDEMPTION_ORDER_TYPE.RETRY_INTERNAL_ON_CHAIN:
                return await this.__redemptionService.retryInternalOnChain(entityId);
            case FIX_REDEMPTION_ORDER_TYPE.RETRY_EXTERNAL_ON_CHAIN:
                return await this.__redemptionService.retryExternalOnChain(entityId);
            default:
                throw new Error(`invaild ${fixType}`);
        }
    }
}
