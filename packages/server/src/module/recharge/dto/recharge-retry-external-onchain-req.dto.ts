import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RechargeRetryExternalOnChainReqDto implements COTCore.Recharge.Api.RechargeRetryExternalOnChainReqDto {
    @ApiProperty({ description: "充值订单id" })
    @IsString()
    orderId!: string;
}
