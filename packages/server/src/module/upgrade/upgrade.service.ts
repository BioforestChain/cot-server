import { BaseUpgradeService } from "@bnqkl/wallet-sdk";
import { Injectable, Inject, forwardRef } from "@nestjs/common";

@Injectable()
export class UpgradeService extends BaseUpgradeService {
    /**补丁信息，将版本往下累加 */
    patchVersionsArray = [];
}
