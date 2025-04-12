import { Validate } from "class-validator";
import { RechargeClassVerify } from "../../../helper";

export class RechargeClassDefine {
    @Validate(RechargeClassVerify)
    recharge: COTCore.Config.RechargeObject;
}
