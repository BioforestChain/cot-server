import { CHAIN_ID } from "@bnqkl/cotcore";
import { ApiProperty } from "@nestjs/swagger";

class AuthInfo implements COTCore.Verify.AuthInfo {
    @ApiProperty({ description: "链ID", enum: CHAIN_ID })
    chainId: CHAIN_ID;
    @ApiProperty({ description: "地址" })
    address: string;
    @ApiProperty({ description: "公钥" })
    publicKey?: string;
    @ApiProperty({ description: "签名" })
    signature: string;
}
