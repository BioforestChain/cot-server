import { InternalAssetType, InternalChainName, Logger, timeTool } from "@bnqkl/wallet-sdk";
import { ValidatorConstraintInterface, ValidationArguments, isArray, isString, isNumber, ValidatorConstraint, isObject } from "class-validator";
import { externalChainHelper, internalChainHelper } from "../helper";
@ValidatorConstraint({ name: "IsStringOrNumber", async: false })
export class IsStringOrNumber implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        return isString(value) || isNumber(value);
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not string or number";
    }
}

@ValidatorConstraint({ name: "IsNumberArray", async: false })
export class IsNumberArray implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        if (isArray(value)) {
            for (let item of value) {
                if (!isNumber(item)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not a number array";
    }
}

@ValidatorConstraint({ name: "IsStringArray", async: false })
export class IsStringArray implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        if (isArray(value)) {
            for (let item of value) {
                if (!isString(item)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not a string array";
    }
}

@ValidatorConstraint({ name: "IsBCFAddress", async: true })
export class IsBCFAddress implements ValidatorConstraintInterface {
    async validate(value: any, validationArguments?: ValidationArguments) {
        if (!(await internalChainHelper.isBCFAddress(value))) {
            return false;
        }
        return true;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not a valid eth address";
    }
}

@ValidatorConstraint({ name: "IsBCFAddressArray", async: true })
export class IsBCFAddressArray implements ValidatorConstraintInterface {
    async validate(value: any, validationArguments?: ValidationArguments) {
        if (isArray(value)) {
            for (let item of value) {
                if (!(await internalChainHelper.isBCFAddress(item))) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not a valid eth address";
    }
}

@ValidatorConstraint({ name: "IsStringNumberPositive", async: false })
export class IsStringNumberPositive implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        if (typeof value === "string" || typeof value === "number") {
            if (!isNaN(value as any)) {
                if (Number(value) > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return " ($value) is not a StringNumberPositive";
    }
}

@ValidatorConstraint({ name: "IsStringNumberNatural", async: false })
export class IsStringNumberNatural implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        if (typeof value === "string" || typeof value === "number") {
            if (!isNaN(value as any)) {
                if (Number(value) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return " ($value) is not a IsStringNumberNatural";
    }
}

@ValidatorConstraint({ name: "IsStringNumber", async: false })
export class IsStringNumber implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        if (typeof value === "string" || typeof value === "number") {
            if (!isNaN(value as any)) {
                return true;
            }
        }
        return false;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is not a StringNumber";
    }
}

@ValidatorConstraint({ name: "VerifyFraction", async: false })
export class VerifyFraction implements ValidatorConstraintInterface {
    validate(value: COTCore.Fraction, validationArguments?: ValidationArguments) {
        const rate = Number(value.numerator) / Number(value.denominator);
        if (isNaN(rate)) {
            return false;
        }
        if (rate <= 0) {
            return false;
        }
        return true;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return "Text ($value) is invaild";
    }
}

@ValidatorConstraint({ name: "IsDateLaterThanNow", async: false })
export class IsDateLaterThanNow implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments) {
        const d = new Date(value).getTime();
        if (isNaN(d)) {
            return false;
        } else {
            if (d < Date.now()) {
                return true;
            }
        }
        return false;
    }

    defaultMessage(validationArguments?: ValidationArguments) {
        return " ($value) is later than now";
    }
}

@ValidatorConstraint({ name: "RechargeClassVerify", async: false })
export class RechargeClassVerify implements ValidatorConstraintInterface {
    async validate(value: COTCore.Config.RechargeObject, validationArguments?: ValidationArguments) {
        for (const chainName in value) {
            if (!InternalChainName[chainName]) {
                return false;
            }
            for (const assetType in value[chainName]) {
                if (!InternalAssetType[assetType]) {
                    return false;
                }
                const item = value[chainName][assetType];
                if (typeof item.enable !== "boolean") {
                    return false;
                }
                if (!(await internalChainHelper.isBCFAddress(item.applyAddress))) {
                    return false;
                }
                if (item.supportChain.ETH) {
                    if (!this.ethCheck(item.supportChain.ETH)) {
                        return false;
                    }
                }
                if (item.supportChain.BSC) {
                    if (!this.ethCheck(item.supportChain.BSC)) {
                        return false;
                    }
                }
                if (item.supportChain.TRON) {
                    if (!this.tronCheck(item.supportChain.TRON)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    ethCheck(item: COTCore.Config.ExternalAssetInfoItem) {
        const { enable, contract, depositAddress } = item;
        if (typeof enable !== "boolean") {
            return false;
        }
        if (contract) {
            if (!externalChainHelper.isEthAddress(contract)) {
                return false;
            }
        }
        if (!externalChainHelper.isEthAddress(depositAddress)) {
            return false;
        }
        return true;
    }

    tronCheck(item: COTCore.Config.ExternalAssetInfoItem) {
        const { enable, contract, depositAddress } = item;
        if (typeof enable !== "boolean") {
            return false;
        }
        if (contract) {
            if (!externalChainHelper.isTronAddress(contract)) {
                return false;
            }
        }
        if (!externalChainHelper.isTronAddress(depositAddress)) {
            return false;
        }
        return true;
    }
    defaultMessage(validationArguments?: ValidationArguments) {
        return " ($value) is later than now";
    }
}
