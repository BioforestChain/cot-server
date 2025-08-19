import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RedemptionRetryExternalOnChainReqDto implements COTCore.Redemption.Api.RedemptionRetryExternalOnChainReqDto {
    @ApiProperty({ description: "赎回订单id" })
    @IsString()
    orderId!: string;
}
