import { CHAIN_ID } from "@bnqkl/cotcore";
import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

class AuthInfo implements COTCore.Verify.AuthInfo {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "链ID", enum: CHAIN_ID })
    chainId: CHAIN_ID;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "地址" })
    address: string;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "公钥" })
    publicKey?: string;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: "签名" })
    signature: string;
}
