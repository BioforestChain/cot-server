import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RechargeRecordDetailReqDto implements COTCore.Recharge.Api.RechargeRecordDetailReqDto {
    @IsNotEmpty()
    @ApiProperty({ description: "充值订单id" })
    orderId!: string;
}
