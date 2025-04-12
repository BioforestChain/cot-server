import { ApiProperty } from "@nestjs/swagger";
import { PageReqDto } from "../../../common";

export class UserLoginReqDto implements COTCore.Api.Admin.User.LoginReqDto {
    @ApiProperty({ description: "登录账号" })
    loginName: string;
    @ApiProperty({ description: "密码" })
    password: string;
}

export class UserLoginResDto implements COTCore.AdminAuthInfo {
    @ApiProperty({ description: "登录账号" })
    loginName: string;
    @ApiProperty({ description: "过期时间" })
    expiredTime: number;
    @ApiProperty({ description: "token" })
    token: string;
}

export class CreateUserReqDto implements COTCore.Api.Admin.User.CreateUserReqDto {
    @ApiProperty({ description: "登录账号" })
    loginName: string;
    @ApiProperty({ description: "密码, md5" })
    password: string;
    @ApiProperty({ description: "昵称" })
    nickName: string;
}

export class UpdateUserReqDto implements COTCore.Api.Admin.User.UpdateUserReqDto {
    @ApiProperty({ description: "旧密码" })
    oldPassword: string;
    @ApiProperty({ description: "新密码" })
    newPassword: string;
}

export class GetOperateRecordListReqDto extends PageReqDto implements COTCore.Api.Admin.User.GetOperateRecordListReqDto {
    @ApiProperty({ description: "操作账号", required: false })
    loginName: string;
    @ApiProperty({ description: "api", required: false })
    api: string;
}
