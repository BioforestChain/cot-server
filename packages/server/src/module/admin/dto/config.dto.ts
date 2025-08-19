import { Validate } from "class-validator";
import { RechargeClassVerify } from "../../../helper/index.js";

export class RechargeClassDefine {
    @Validate(RechargeClassVerify)
    recharge!: COTCore.Config.RechargeObject;
}
