import { HttpHelper } from "../httpHelper";

export async function getToken(httpHelper: HttpHelper, argv: COTCore.Verify.Api.GetTokenReqDto) {
    const apiPath = "cotbfm/verify/token";
    return await httpHelper.post<COTCore.Verify.Api.GetTokenReqDto, COTCore.Verify.Api.GetTokenResDto>(apiPath, argv);
}

export async function setConfig(httpHelper: HttpHelper, argv: COTCore.Verify.Api.SetBusinessConfigReqDto) {
    const apiPath = "cotbfm/verify/setconfig";
    return await httpHelper.post<COTCore.Verify.Api.SetBusinessConfigReqDto, COTCore.Verify.Api.SetBusinessConfigResDto>(apiPath, argv);
}

export async function getConfig(httpHelper: HttpHelper, argv: { verifyKey: string }) {
    const apiPath = "cotbfm/verify/getconfig";
    return await httpHelper.post<{ verifyKey: string }, COTCore.Verify.Api.GetBusinessConfigResDto>(apiPath, argv);
}

export async function injectAddress(httpHelper: HttpHelper, argv: COTCore.Verify.Api.InjectAddressReqDto) {
    const apiPath = "cotbfm/verify/inject";
    return await httpHelper.post<COTCore.Verify.Api.InjectAddressReqDto, COTCore.Verify.Api.InjectAddresResDto>(apiPath, argv);
}

export async function getAddress(httpHelper: HttpHelper) {
    const apiPath = "cotbfm/verify/address";
    return await httpHelper.get<{}, COTCore.Verify.Api.GetBusinessConfigResDto>(apiPath, {});
}

export async function test(httpHelper: HttpHelper, argv: COTCore.Verify.Api.GetVerifyCodeReqDto) {
    const apiPath = "cotbfm/verify/test";
    return await httpHelper.get<COTCore.Verify.Api.GetVerifyCodeReqDto, string>(apiPath, argv);
}
