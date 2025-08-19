import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RechargeV2ReqDto implements COTCore.Recharge.Api.RechargeV2ReqDto {
    @IsNotEmpty()
    @ApiProperty({ description: "交易签名数据" })
    fromTrJson!: WalletTypings.ExternalChain.FromTrJson;

    @IsNotEmpty()
    @ApiProperty({ description: "投入权益参数" })
    message!: COTCore.Recharge.RechargeV2ToTrInfoData;
    @IsNotEmpty()
    @ApiProperty({ description: "验签信息" })
    signatureInfo!: COTCore.Verify.SignatureInfo;
}
