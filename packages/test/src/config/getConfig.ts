import { bfmetaSignUtil } from "@bnqkl/cot-server";
import { HttpHelper } from "../httpHelper.js";
import { getConfig } from "./api.js";

(async () => {
    try {
        const httpHelper = new HttpHelper();

        const serverPublicKey = await bfmetaSignUtil.getPublicKeyBySecret("serverKey");
        const verifyKey = await bfmetaSignUtil.encryptData("zzz", "clientKey", serverPublicKey);
        const result = await getConfig(httpHelper, { verifyKey });

        console.log(JSON.stringify(result, null, 4));
    } catch (error) {
        console.log(error);
    }
})();
