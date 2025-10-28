import { PageReqDto } from "../../../common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ExternalChainName, InternalChainName, RECHARGE_RECORD_STATE } from "@bnqkl/cotcore";
import { Type } from "class-transformer";

export class RechargeRecordsReqDto extends PageReqDto implements COTCore.Recharge.Api.RechargeRecordsReqDto {
    @ApiProperty({ description: "内链名", required: false })
    internalChain?: InternalChainName;

    @IsString()
    @ApiProperty({ description: "内链发起地址", required: false })
    internalAddress: string;

    @IsOptional()
    @ApiProperty({ enum: RECHARGE_RECORD_STATE, description: "充值记录状态", required: false })
    @Type(() => Number)
    recordState?: RECHARGE_RECORD_STATE;
}
