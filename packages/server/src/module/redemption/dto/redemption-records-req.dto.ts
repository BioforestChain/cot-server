import { PageReqDto } from "../../../common";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { InternalChainName } from "@bnqkl/wallet-sdk";
export class RedemptionRecordsReqDto extends PageReqDto implements COTCore.Redemption.Api.RedemptionRecordsReqDto {
    @ApiProperty({ description: "内链名", required: false })
    internalChain?: InternalChainName;

    @IsString()
    @ApiProperty({ description: "内链发起地址", required: false })
    internalAddress: string;
}
