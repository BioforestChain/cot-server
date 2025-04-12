import { encodeRechargeV2ToTrInfoData, COT_RECHARGE_API_REQUEST } from "@cot/core";
import { Body, Controller, forwardRef, Get, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { internalChainHelper, VerifyHelper } from "../../helper";
import {
    RechargeRecordsReqDto,
    RechargeRetryExternalOnChainReqDto,
    RechargeRetryInternalOnChainReqDto,
    RechargeRecordDetailReqDto,
    RechargeV2ReqDto,
} from "./dto";
import { RechargeService } from "./recharge.service";

@ApiTags("RECHARGE")
@Controller()
export class RechargeController {
    @Inject(forwardRef(() => RechargeService))
    private __rechargeService!: RechargeService;

    @Post(COT_RECHARGE_API_REQUEST.RETRY_EXTERNAL_ONCHAIN)
    @ApiOperation({ summary: "充值订单重试外链上链" })
    retryExternalOnChain(@Body() dto: RechargeRetryExternalOnChainReqDto): Promise<COTCore.Recharge.Api.RechargeRetryExternalOnChainResDto> {
        return this.__rechargeService.retryExternalOnChain(dto.orderId);
    }

    @Post(COT_RECHARGE_API_REQUEST.RETRY_INTERNAL_ONCHAIN)
    @ApiOperation({ summary: "充值订单重试内链上链" })
    retryInternalOnChain(@Body() dto: RechargeRetryInternalOnChainReqDto): Promise<COTCore.Recharge.Api.RechargeRetryInternalOnChainResDto> {
        return this.__rechargeService.retryInternalOnChain(dto.orderId);
    }

    @Get(COT_RECHARGE_API_REQUEST.RECORDS)
    @ApiOperation({ summary: "获取充值记录列表" })
    getRecords(@Query() dto: RechargeRecordsReqDto): Promise<COTCore.Recharge.Api.RechargeRecordsResDto> {
        return this.__rechargeService.getRecords(dto);
    }

    @Get(COT_RECHARGE_API_REQUEST.RECORD_DETAIL)
    @ApiOperation({ summary: "获取充值记录详情" })
    getRecordDetail(@Query() dto: RechargeRecordDetailReqDto): Promise<COTCore.Recharge.Api.RechargeRecordDetailResDto> {
        return this.__rechargeService.getRecordDetail(dto.orderId);
    }

    @Get(COT_RECHARGE_API_REQUEST.SUPPORT)
    @ApiOperation({ summary: "获取当前充值允许的代币" })
    getRechageSupport(): Promise<COTCore.Recharge.Api.RechageSupportResDto> {
        return this.__rechargeService.getRechageSupport();
    }

    @Get(COT_RECHARGE_API_REQUEST.CONTRACT_POOL_INFO)
    @ApiOperation({ summary: "获取合约池信息, 10分钟的缓存" })
    getContractPoolInfo() {
        return this.__rechargeService.getContractPoolInfo();
    }

    @Post(COT_RECHARGE_API_REQUEST.RECHARGE_V2)
    @ApiOperation({ summary: "充值" })
    async rechargeV2(@Body() dto: RechargeV2ReqDto): Promise<COTCore.Recharge.Api.RechargeResDto> {
        const { message, signatureInfo } = dto;
        const { address } = message;
        if (!(await internalChainHelper.isBCFAddress(address))) {
            throw Error(`address:${address} is not BCF address`);
        }
        await VerifyHelper.verifySignature(signatureInfo, encodeRechargeV2ToTrInfoData(message), address);
        return this.__rechargeService.rechargeV2(dto);
    }

    // @Post("retryExternalOnChain")
    // @ApiOperation({ summary: "充值订单重试外链上链" })
    // retryExternalOnChain(
    //     @Authorization({ required: true }) authorization: COTServer.CurrentAuthInfo,
    //     @Body() dto: RechargeRetryExternalOnChainReqDto,
    // ): Promise<COTCore.Recharge.Api.RechargeRetryExternalOnChainResDto> {
    //     return this.__rechargeService.retryExternalOnChain(dto.orderId, authorization);
    // }
}
