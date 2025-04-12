import { NetWorkHelper, staticConfig } from "@cot/server";
import { AdminApi } from "./api";
import { EncryptHelper } from "@bnqkl/server-util";
import * as crypto from "crypto";

import { bfmetaSignUtil, timeTool, InternalChainName, InternalAssetType } from "@cot/server";

(async () => {
    try {
        const username = "syj";
        const p = "123123";
        const password = EncryptHelper.SHA256JS(p);
        const z = crypto.createHash("sha256").update(p).digest("hex");
        const networkHelper = new NetWorkHelper(staticConfig.test.serverIp ?? "localhost", staticConfig.test.port ?? staticConfig.ports.web);
        const loginResult = await AdminApi.login({ loginName: username, password }, networkHelper);
        networkHelper.httpToken = loginResult.token;

        // result = await AdminApi.getRechargeConfig({}, networkHelper);
        // console.log(JSON.stringify(result, null, 4));

        // result = await AdminApi.getRedemptionConfig({}, networkHelper);
        // console.log(JSON.stringify(result, null, 4));
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
})();
