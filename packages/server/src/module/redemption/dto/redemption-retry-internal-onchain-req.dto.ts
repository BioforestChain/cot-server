import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RedemptionRetryInternalOnChainReqDto implements COTCore.Redemption.Api.RedemptionRetryInternalOnChainReqDto {
    @ApiProperty({ description: "赎回订单id" })
    @IsString()
    orderId: string;
}
