import { ApiProperty } from "@nestjs/swagger";

class PaymentBusinessConfig implements COTCore.Config.BusinessConfig {
    @ApiProperty({ description: "充值" })
    recharge: COTCore.Config.BusinessConfig["recharge"];
}

export class PaymentGetBusinessConfigResDto implements COTCore.Verify.Api.GetBusinessConfigResDto {
    @ApiProperty({ description: "配置信息", type: PaymentBusinessConfig })
    config: PaymentBusinessConfig;
}
