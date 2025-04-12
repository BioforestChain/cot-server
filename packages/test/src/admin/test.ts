import { EncryptHelper } from "@bnqkl/server-util";
import { NetWorkHelper, staticConfig } from "@cot/server";
import { AdminApi } from "./api";
import * as crypto from "crypto";
(async () => {
    try {
        const username = "wzx";
        const p = "112233";
        const password = EncryptHelper.SHA256JS(p);
        const z = crypto.createHash("sha256").update(p).digest("hex");
        console.log(password, z, password === z);
        const networkHelper = new NetWorkHelper(staticConfig.test.serverIp ?? "localhost", staticConfig.test.port ?? staticConfig.ports.web);
        const result = await AdminApi.login({ loginName: username, password }, networkHelper);
        networkHelper.httpToken = result.token;
        console.log("login... ", result);

        const r2 = await AdminApi.getRechargeOrders({ page: 1, pageSize: 10 }, networkHelper);
        console.log(r2.dataList.length);
        if (r2.dataList.length > 0) {
            const entityId = r2.dataList[0].entityId;
            const r3 = await AdminApi.getRechargeOrderDetail({ entityId }, networkHelper);
            console.log(r3);
        }

        const r4 = await AdminApi.getRedemptionOrders({ page: 1, pageSize: 10 }, networkHelper);
        console.log(r4.dataList.length);
        if (r4.dataList.length > 0) {
            const entityId = r4.dataList[0].entityId;
            const r5 = await AdminApi.getRedemptionOrderDetail({ entityId }, networkHelper);
            console.log(r5);
        }
    } catch (error) {
        console.log(error);
    }
})();
