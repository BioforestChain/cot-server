import { COT_RECHARGE_API_REQUEST, NetWorkHelper } from "@bnqkl/cot-server";

export class RechargeApi {
    /**
     * 充值
     * @param request
     * @param networkHelper
     * @returns
     */
    static async rechargeV2(request: COTCore.Recharge.Api.RechargeV2ReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<COTCore.Recharge.Api.RechargeV2ReqDto, COTCore.Recharge.Api.RechargeResDto>(
            COT_RECHARGE_API_REQUEST.RECHARGE_V2,
            request,
        );
        return result;
    }
}
