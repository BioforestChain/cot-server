import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PaymentGetBusinessConfigReqDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "verifyKey" })
    verifyKey: string;
}
