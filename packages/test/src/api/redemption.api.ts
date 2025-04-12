import { COT_REDEMPTION_API_REQUEST, NetWorkHelper } from "@cot/server";

export class RedemptionApi {
    /**
     * 赎回
     * @param request
     * @param networkHelper
     * @returns
     */
    static async redemptionV2(request: COTCore.Redemption.Api.RedemptionV2ReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<COTCore.Redemption.Api.RedemptionV2ReqDto, COTCore.Redemption.Api.RedemptionV2ResDto>(
            COT_REDEMPTION_API_REQUEST.REDEMPTION_V2,
            request,
        );
        return result;
    }
}
