import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RechargeRetryInternalOnChainReqDto implements COTCore.Recharge.Api.RechargeRetryInternalOnChainReqDto {
    @ApiProperty({ description: "充值订单id" })
    @IsString()
    orderId!: string;
}
