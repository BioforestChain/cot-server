import { Controller, Get, Post, Body, Inject } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { UserLoginReqDto, CreateUserReqDto, UpdateUserReqDto, GetOperateRecordListReqDto } from "../dto/user.dto.js";
import { UserLoginResDto } from "../dto/user.dto.js";
import { AdminAuthorization } from "../../../common/index.js";

@ApiTags("ADMIN/USER")
@Controller("/admin/user")
export class UserController {
    @Inject(UserService)
    private __userService!: UserService;

    @Post("create")
    @ApiOperation({ summary: "admin-创建用户" })
    async createUser(@AdminAuthorization({ required: true }) auth: COTCore.AdminAuthInfo, @Body() dto: CreateUserReqDto) {
        return this.__userService.createUser(auth, dto);
    }

    @Post("update")
    @ApiOperation({ summary: "admin-修改用户信息" })
    async updateUser(@AdminAuthorization({ required: true }) auth: COTCore.AdminAuthInfo, @Body() dto: UpdateUserReqDto) {
        return this.__userService.updateUser(auth, dto);
    }

    @Post("login")
    @ApiOperation({ summary: "admin-用户登录" })
    @ApiOkResponse({ type: UserLoginResDto })
    async login(@AdminAuthorization() auth: COTCore.AdminAuthInfo, @Body() dto: UserLoginReqDto) {
        return await this.__userService.login(auth, dto);
    }

    @Post("operate/query")
    @ApiOperation({ summary: "用户操作查询" })
    getOperateRecordList(@AdminAuthorization({ required: true }) authorization: COTCore.AdminAuthInfo, @Body() dto: GetOperateRecordListReqDto) {
        return this.__userService.getOperateRecordList(dto);
    }
}
