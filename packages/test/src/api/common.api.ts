import { Logger, COT_VERIFY_API_REQUEST, NetWorkHelper } from "@cot/server";

export abstract class CommonApi {
    static async getToken(argv: COTCore.Verify.Api.GetTokenReqDto, networkHelper: NetWorkHelper) {
        Logger.debug("getToken = ", argv);
        const result = await networkHelper.post<COTCore.Verify.Api.GetTokenReqDto, COTCore.Verify.Api.GetTokenResDto>(COT_VERIFY_API_REQUEST.GET_TOKEN, argv);
        return result;
    }

    static async login(info: COTServerTest.Account["info"], networkHelper: NetWorkHelper) {
        const { deviceId, secret, secret2 } = info;
        const authInfos: COTCore.Verify.AuthInfo[] = [];
        const argv = { secret, deviceId };
        const { token, addressCode } = await this.getToken({ deviceId, authInfos }, networkHelper);
        // token
        Logger.debug(`token =`, token);
        networkHelper.httpToken = token;
        const address = authInfos[0].address;
        return addressCode[address];
    }
}
