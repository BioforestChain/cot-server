import { HttpHelper } from "../httpHelper.js";

export async function getToken(httpHelper: HttpHelper, argv: COTCore.Verify.Api.GetTokenReqDto) {
    const apiPath = "cot/verify/token";
    return await httpHelper.post<COTCore.Verify.Api.GetTokenReqDto, COTCore.Verify.Api.GetTokenResDto>(apiPath, argv);
}

export async function setConfig(httpHelper: HttpHelper, argv: COTCore.Verify.Api.SetBusinessConfigReqDto) {
    const apiPath = "cot/verify/setconfig";
    return await httpHelper.post<COTCore.Verify.Api.SetBusinessConfigReqDto, COTCore.Verify.Api.SetBusinessConfigResDto>(apiPath, argv);
}

export async function getConfig(httpHelper: HttpHelper, argv: { verifyKey: string }) {
    const apiPath = "cot/verify/getconfig";
    return await httpHelper.post<{ verifyKey: string }, COTCore.Verify.Api.GetBusinessConfigResDto>(apiPath, argv);
}

export async function injectAddress(httpHelper: HttpHelper, argv: COTCore.Verify.Api.InjectAddressReqDto) {
    const apiPath = "cot/verify/inject";
    return await httpHelper.post<COTCore.Verify.Api.InjectAddressReqDto, COTCore.Verify.Api.InjectAddresResDto>(apiPath, argv);
}

export async function getAddress(httpHelper: HttpHelper) {
    const apiPath = "cot/verify/address";
    return await httpHelper.get<{}, COTCore.Verify.Api.GetBusinessConfigResDto>(apiPath, {});
}

export async function test(httpHelper: HttpHelper, argv: COTCore.Verify.Api.GetVerifyCodeReqDto) {
    const apiPath = "cot/verify/test";
    return await httpHelper.get<COTCore.Verify.Api.GetVerifyCodeReqDto, string>(apiPath, argv);
}
