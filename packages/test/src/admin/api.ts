import { BasePageData, NetWorkHelper, OperateRecordEntity, RechargeOrder, RedemptionOrder } from "@cot/server";

export class AdminApi {
    static async login(request: COTCore.Api.Admin.User.LoginReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/user/login";
        const result = await networkHelper.post<COTCore.Api.Admin.User.LoginReqDto, COTCore.AdminAuthInfo>(apiPath, request);
        return result;
    }

    static async getIpStatInfo(request: {}, networkHelper: NetWorkHelper) {
        const apiPath = "admin/system/getIpStatInfo";
        const result = await networkHelper.get<{}, {}>(apiPath, request);
        return result;
    }

    static async getRechargeOrders(request: COTCore.Api.Admin.Order.GetRechargeOrdersReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/order/recharge/list";
        const result = await networkHelper.post<COTCore.Api.Admin.Order.GetRechargeOrdersReqDto, BasePageData<RechargeOrder>>(apiPath, request);
        return result;
    }
    static async getRechargeOrderDetail(request: COTCore.Api.Admin.Order.GetOrderDetailReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/order/recharge/detail";
        const result = await networkHelper.post<COTCore.Api.Admin.Order.GetOrderDetailReqDto, RechargeOrder>(apiPath, request);
        return result;
    }
    static async getRedemptionOrders(request: COTCore.Api.Admin.Order.GetRedemptionOrdersReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/order/redemption/list";
        const result = await networkHelper.post<COTCore.Api.Admin.Order.GetRedemptionOrdersReqDto, BasePageData<RedemptionOrder>>(apiPath, request);
        return result;
    }
    static async getRedemptionOrderDetail(request: COTCore.Api.Admin.Order.GetOrderDetailReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/order/redemption/detail";
        const result = await networkHelper.post<COTCore.Api.Admin.Order.GetOrderDetailReqDto, RedemptionOrder>(apiPath, request);
        return result;
    }

    static async getOperateRecordList(request: COTCore.Api.Admin.User.GetOperateRecordListReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/user/operate/query";
        const result = await networkHelper.post<COTCore.Api.Admin.User.GetOperateRecordListReqDto, BasePageData<OperateRecordEntity>>(apiPath, request);
        return result;
    }

    static async getRechargeConfig(request: {}, networkHelper: NetWorkHelper) {
        const apiPath = "admin/config/recharge/get";
        return await networkHelper.post<{}, COTCore.Api.Admin.Config.GetRechargeConfigResDto>(apiPath, request);
    }
    static async setRecharge(request: COTCore.Api.Admin.Config.SetRechargeConfigReqDto, networkHelper: NetWorkHelper) {
        const apiPath = "admin/config/recharge/set";
        return await networkHelper.post<COTCore.Api.Admin.Config.SetRechargeConfigReqDto, Object>(apiPath, request);
    }
}
