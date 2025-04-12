import { Body, Controller, forwardRef, Get, Inject, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
    RedemptionRecordDetailReqDto,
    RedemptionRecordsReqDto,
    RedemptionRetryExternalOnChainReqDto,
    RedemptionRetryInternalOnChainReqDto,
    RedemptionV2ReqDto,
} from "./dto";
import { RedemptionService } from "./redemption.service";
import { COT_REDEMPTION_API_REQUEST } from "@cot/core";

@ApiTags("REDEMPTION")
@Controller()
export class RedemptionController {
    @Inject(forwardRef(() => RedemptionService))
    private __redemptionService!: RedemptionService;

    @Post(COT_REDEMPTION_API_REQUEST.RETRY_EXTERNAL_ONCHAIN)
    @ApiOperation({ summary: "赎回订单重试外链上链" })
    retryExternalOnChain(@Body() dto: RedemptionRetryExternalOnChainReqDto): Promise<COTCore.Redemption.Api.RedemptionRetryExternalOnChainResDto> {
        return this.__redemptionService.retryExternalOnChain(dto.orderId);
    }

    @Post(COT_REDEMPTION_API_REQUEST.RETRY_INTERNAL_ONCHAIN)
    @ApiOperation({ summary: "赎回订单重试内链上链" })
    retryInternalOnChain(@Body() dto: RedemptionRetryInternalOnChainReqDto): Promise<COTCore.Redemption.Api.RedemptionRetryInternalOnChainResDto> {
        return this.__redemptionService.retryInternalOnChain(dto.orderId);
    }

    @Get(COT_REDEMPTION_API_REQUEST.RECORDS)
    @ApiOperation({ summary: "获取赎回记录列表" })
    getRecords(@Query() dto: RedemptionRecordsReqDto): Promise<COTCore.Redemption.Api.RedemptionRecordsResDto> {
        return this.__redemptionService.getRecords(dto);
    }

    @Get(COT_REDEMPTION_API_REQUEST.RECORD_DETAIL)
    @ApiOperation({ summary: "获取赎回记录详情" })
    getRecordDetail(@Query() dto: RedemptionRecordDetailReqDto): Promise<COTCore.Redemption.Api.RedemptionRecordDetailResDto> {
        return this.__redemptionService.getRecordDetail(dto.orderId);
    }

    @Post(COT_REDEMPTION_API_REQUEST.REDEMPTION_V2)
    @ApiOperation({ summary: "赎回" })
    redemptionV2(@Body() dto: RedemptionV2ReqDto): Promise<COTCore.Redemption.Api.RedemptionV2ResDto> {
        return this.__redemptionService.redemptionV2(dto);
    }
}
