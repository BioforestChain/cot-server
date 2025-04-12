import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RedemptionV2ReqDto implements COTCore.Redemption.Api.RedemptionV2ReqDto {
    @IsNotEmpty()
    @ApiProperty({ description: "交易签名数据" })
    fromTrJson: COTCore.Redemption.RedemptionV2Tr;
}
