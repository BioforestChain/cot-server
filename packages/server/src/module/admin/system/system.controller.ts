import { Controller, forwardRef, Get, Inject, Query, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GlobalValueRedisRepository } from "../../redis/global-value.redis-repository";
import { SystemService } from "./system.service";
// import { AdminReqDto } from "../dto/admin-req.dto";
import { AdminAuthorization } from "../../../common";
import { RequestStatRedisRepository } from "@bnqkl/wallet-sdk";

@ApiTags("ADMIN/SYSTEM")
@Controller("admin/system")
export class SystemController {
    @Inject(forwardRef(() => SystemService))
    private __systemService!: SystemService;
    @Inject(forwardRef(() => RequestStatRedisRepository))
    private __requestStatRedisRepository!: RequestStatRedisRepository;

    @Get("writeHeapSnapshop")
    writeHeapSnapshop(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo): string | undefined {
        return this.__systemService.writeHeapSnapshop();
    }

    @Get("getIpStatInfo")
    getIpCallInterfaceStatInfo(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo) {
        return this.__requestStatRedisRepository.getIpCallInterfaceStatInfo();
    }
}
