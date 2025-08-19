import type { ExternalAssetType, ExternalChainName, INTERNAL_CHAIN_RW_ACCOUNT_TYPE } from "@bnqkl/cot-core";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PaymentInjectAddressReqDto implements COTCore.Verify.Api.InjectAddressReqDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "注入账户的类型" })
    accountType!: INTERNAL_CHAIN_RW_ACCOUNT_TYPE;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "注入的私钥密文" })
    keypairStr!: string;
}

export class PaymentGetInjectAddressResDto implements COTCore.Verify.Api.GetInjectAddressResDto {
    @ApiProperty({ description: "注入的地址" })
    addressObj!: { [accountType: string]: string };
}

export class PaymentInjectExternalAddressReqDto implements COTCore.Verify.Api.InjectExternalAddressReqDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "链名" })
    chainName!: ExternalChainName;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "货币类型" })
    assetType!: ExternalAssetType;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "注入的私钥密文" })
    keypairStr!: string;
}
