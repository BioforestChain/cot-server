import { Controller, forwardRef, Get, Inject, Query, Post, Body } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminAuthorization } from "../../../common";
import { GlobalValueRedisRepository } from "../../redis";
import { RechargeClassDefine } from "../dto/config.dto";
import { ConfigService } from "./config.service";

@ApiTags("ADMIN/CONFIG")
@Controller("admin/config")
export class ConfigController {
    @Inject(forwardRef(() => ConfigService))
    private __configService!: ConfigService;
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    @Post("/recharge/get")
    @ApiOperation({ summary: "获取充值配置信息" })
    getRechargeConfig(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo): Promise<COTCore.Api.Admin.Config.GetRechargeConfigResDto> {
        return this.__globalValueRedisRepository.getConfigByKey("recharge");
    }

    @Post("/recharge/set")
    @ApiOperation({ summary: "设置充值配置信息" })
    setRecharge(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: RechargeClassDefine) {
        return this.__configService.setRecharge(dto.recharge);
    }
}
