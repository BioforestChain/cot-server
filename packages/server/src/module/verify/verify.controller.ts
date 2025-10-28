import { Body, Controller, Get, Post, Inject, forwardRef } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GlobalValueRedisRepository } from "../redis/global-value.redis-repository";
import { MemoryService } from "../memory/memory.service";
import {
    PaymentGetBusinessConfigResDto,
    PaymentSetBusinessConfigReqDto,
    PaymentInjectAddressReqDto,
    PaymentGetInjectAddressResDto,
    PaymentInjectExternalAddressReqDto,
} from "./dto";
import { PaymentGetBusinessConfigReqDto } from "./dto/payment-get-config-req.dto";
import { COT_VERIFY_API_REQUEST } from "@bnqkl/cotcore";

@ApiTags("VERIFY")
@Controller()
export class VerifyController {
    @Inject(forwardRef(() => MemoryService))
    private __memoryService!: MemoryService;
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    @Post(COT_VERIFY_API_REQUEST.GET_CONFIG)
    @ApiOperation({ summary: "获取配置信息" })
    @ApiOkResponse({ type: PaymentGetBusinessConfigResDto })
    getConfig(@Body() dto: PaymentGetBusinessConfigReqDto) {
        return this.__globalValueRedisRepository.getConfigByController(dto.verifyKey);
    }

    @Post(COT_VERIFY_API_REQUEST.SET_CONFIG)
    @ApiOperation({ summary: "设置配置信息" })
    @ApiOkResponse({ type: Boolean })
    setConfig(@Body() dto: PaymentSetBusinessConfigReqDto) {
        return this.__globalValueRedisRepository.setConfig(dto.config);
    }

    @Get(COT_VERIFY_API_REQUEST.GET_INJECT_ADDRESS)
    @ApiOperation({ summary: "获取已注入私钥的地址" })
    @ApiOkResponse({ type: PaymentGetInjectAddressResDto })
    getInjectAddressConfig() {
        return this.__memoryService.getInjectAddress();
    }

    @Post(COT_VERIFY_API_REQUEST.INJECT_SECRET)
    @ApiOperation({ summary: "设置注入的私钥" })
    @ApiOkResponse({ type: Boolean })
    injectAddress(@Body() dto: PaymentInjectAddressReqDto) {
        return this.__memoryService.injectRWAddress(dto.accountType, dto.keypairStr);
    }

    @Get(COT_VERIFY_API_REQUEST.GET_INJECT_EXTERNAL_ADDRESS)
    @ApiOperation({ summary: "获取已注入私钥的外链地址" })
    @ApiOkResponse({ type: PaymentGetInjectAddressResDto })
    getInjectExternalAddress() {
        return this.__globalValueRedisRepository.getInjectExternalAddressObj();
    }

    @Post(COT_VERIFY_API_REQUEST.INJECT_EXTERNAL_SECRET)
    @ApiOperation({ summary: "注入外链私钥" })
    @ApiOkResponse({ type: Boolean })
    injectExternalAddress(@Body() dto: PaymentInjectExternalAddressReqDto) {
        const { chainName, assetType, keypairStr } = dto;
        return this.__globalValueRedisRepository.injectExternalAddress(chainName, assetType, keypairStr);
    }
}
