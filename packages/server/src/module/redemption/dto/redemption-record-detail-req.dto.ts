import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RedemptionRecordDetailReqDto implements COTCore.Redemption.Api.RedemptionRecordDetailReqDto {
    @IsNotEmpty()
    @ApiProperty({ description: "订单id" })
    orderId: string;
}
