import { bfmetaSignUtil } from "@cot/server";
import { HttpHelper } from "../httpHelper";
import { getConfig, injectAddress, getAddress } from "./api";

(async () => {
    try {
        const httpHelper = new HttpHelper("https://walletapi.bfmeta.info", 443);

        const serverPublicKey = await bfmetaSignUtil.getPublicKeyBySecret("rec6hhioa");
        const verifyKey = await bfmetaSignUtil.encryptData(
            "salad level analyst congress dice cigar grocery wood trap cat sentence inflict poverty cricket resource jewel street deal tiger trim grit abuse poem smile",
            "g42hqibk",
            serverPublicKey,
        );
        const result = await getConfig(httpHelper, { verifyKey });

        console.log(JSON.stringify(result, null, 4));
        // const result2 = await injectAddress(httpHelper, {
        //     accountType: "RECHARGEV2_ACCOUNT_BFMCHAIN_USDT" as any,
        //     keypairStr: verifyKey,
        // });
        // console.log(JSON.stringify(result2, null, 4));
        // const result = await getAddress(httpHelper);
        // console.log(JSON.stringify(result, null, 4));
    } catch (error) {
        console.log(error);
    }
})();
