import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class PageReqDto implements COTServer.PageRequest {
    @ApiProperty({ description: "第几页", default: 1 })
    @IsNumber()
    @Type(() => Number)
    page!: number;

    @ApiProperty({ description: "每页记录数", default: 10, maximum: 50 })
    @IsNumber()
    @Type(() => Number)
    pageSize!: number;
}
