import type {
    ExternalChainName,
    FIX_RECHARGE_ORDER_TYPE,
    FIX_REDEMPTION_ORDER_TYPE,
    InternalChainName,
    RECHARGE_ORDER_STATE_ID,
    REDEMPTION_ORDER_STATE_ID,
} from "@bnqkl/cot-core";
import { ApiProperty } from "@nestjs/swagger";
import { PageReqDto } from "../../../common/index.js";

export class GetOrderDetailReqDto implements COTCore.Api.Admin.Order.GetOrderDetailReqDto {
    /**订单id */
    @ApiProperty({ description: "订单id" })
    entityId!: string;
}
export class GetRechargeOrdersReqDto extends PageReqDto implements COTCore.Api.Admin.Order.GetRechargeOrdersReqDto {
    /**订单id */
    @ApiProperty({ description: "订单id", required: false })
    entityId?: string;
    /**外链充值地址 */
    @ApiProperty({ description: "外链充值地址", required: false })
    walletAddress?: string;
    /**外链交易hash */
    @ApiProperty({ description: "外链交易hash", required: false })
    walletTxId?: string;
    /**内链充值到账地址 */
    @ApiProperty({ description: "内链充值到账地址", required: false })
    internalAddress?: string;
    /**订单状态 */
    @ApiProperty({ description: "订单状态", required: false })
    orderState?: RECHARGE_ORDER_STATE_ID;
}

export class FixRechargeOrderReqDto implements COTCore.Api.Admin.Order.FixRechargeOrderReqDto {
    /**订单id */
    @ApiProperty({ description: "订单id" })
    entityId!: string;
    /**订单id */
    @ApiProperty({ description: "订单修改方式" })
    fixType!: FIX_RECHARGE_ORDER_TYPE;
}

export class GetRedemptionOrdersReqDto extends PageReqDto implements COTCore.Api.Admin.Order.GetRedemptionOrdersReqDto {
    @ApiProperty({ description: "订单id", required: false })
    entityId?: string;
    @ApiProperty({ description: "内链发起地址", required: false })
    internalAddress?: string;
    @ApiProperty({ description: "内链充值交易entityId", required: false })
    redemptionTxId?: string;
    @ApiProperty({ description: "外链接收地址", required: false })
    walletAddress?: string;
    @ApiProperty({ description: "外链交易hash", required: false })
    walletTxId?: string;
    /**订单状态 */
    @ApiProperty({ description: "订单状态", required: false })
    orderState?: REDEMPTION_ORDER_STATE_ID;
}

export class FixRedemptionOrderReqDto implements COTCore.Api.Admin.Order.FixRedemptionOrderReqDto {
    /**订单id */
    @ApiProperty({ description: "订单id" })
    entityId!: string;
    /**订单id */
    @ApiProperty({ description: "订单修改方式" })
    fixType!: FIX_REDEMPTION_ORDER_TYPE;
}

export class GetExternalTransReqDto implements WalletTypings.ExternalChain.Api.GetExternalTransReqDto {
    @ApiProperty({ description: "链名" })
    chainName!: ExternalChainName;
    @ApiProperty({ description: "交易表entityId" })
    txId!: string;
}

export class GetInternalTransReqDto implements WalletTypings.InternalChain.Api.GetInternalTransReqDto {
    @ApiProperty({ description: "链名" })
    chainName!: InternalChainName;
    @ApiProperty({ description: "交易表entityId" })
    txId!: string;
}
