import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PaymentSetBusinessConfigReqDto implements COTCore.Verify.Api.SetBusinessConfigReqDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "配置文件生成的加密字符串 base64" })
    config: string;
}
