import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { RechargeClassVerify } from "../../helper";

export class BFMBusinessConfig implements COTCore.Config.BusinessConfig {
    /**充值 */
    @ValidateNested()
    @Type(() => RechargeClassVerify)
    recharge: COTCore.Config.RechargeObject;
}
