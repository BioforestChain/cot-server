import { Inject, Injectable } from "@nestjs/common";
import { FindOptionsWhere } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { CommonHelper, EncryptHelper, redisCore, ResponseError } from "@bnqkl/server-util";
import { ErrorCode, USER_STATUS, USER_ROLE } from "@bnqkl/cotcore";
import { VerifyHelper } from "../../../helper";
import { EXPIRED_TIME_REDIS, OperateRecordEntity, OperateRecordRepository, UserEntity, UserRepository, USER_PASSWORD_DEFAULT } from "../../../common";

@Injectable()
export class UserService {
    @Inject(UserRepository)
    private __userRepository: UserRepository;
    @Inject(OperateRecordRepository)
    private __operateRecordRepository: OperateRecordRepository;

    constructor(private __jwtService: JwtService) {}

    /**
     * 登录
     * @param auth
     * @param dto
     * @returns
     */
    async login(auth: COTCore.AdminAuthInfo, dto: COTCore.Api.Admin.User.LoginReqDto): Promise<COTCore.AdminAuthInfo> {
        // 账号是否存在
        const user = await this.__userRepository.findOneBy({ loginName: dto.loginName, status: USER_STATUS.START });
        if (!user) {
            throw new ResponseError(ErrorCode.ADMIN_LOGIN_NAME_ERROR);
        }
        // 校验密码
        if (dto.password !== user.password) {
            throw new ResponseError(ErrorCode.ADMIN_PASSWORD_ERROR);
        }
        const expiredTime = Date.now() + 7 * 24 * 3600 * 1000;
        let res: COTCore.AdminAuthInfo = {
            loginName: dto.loginName,
            expiredTime,
            token: auth?.token,
        };
        const token = this.__jwtService.sign(
            {
                loginName: dto.loginName,
                expiredTime,
            },
            {
                secret: "user_login",
                expiresIn: "7d",
            },
        );
        res.token = token;

        await redisCore.redis.set(VerifyHelper.getAdminKey(res.token), JSON.stringify(res, null, 2), { EX: EXPIRED_TIME_REDIS });
        user.loginTime = new Date();
        await this.__userRepository.save(user);
        return res;
    }

    /**
     * 新增用户
     * @param newUser
     */
    async createUser(auth: COTCore.AdminAuthInfo, newUser: COTCore.Api.Admin.User.CreateUserReqDto) {
        const checkUser = await this.__userRepository.findOneForce({ where: { loginName: auth.loginName } });
        if (checkUser.role !== USER_ROLE.SUPER_ADMIN) {
            throw new ResponseError(ErrorCode.ONLY_SUPER_ADMIN_ADD_USER);
        }
        const user = new UserEntity();
        user.status = USER_STATUS.START;
        if (!CommonHelper.isVaildSHA256(newUser.password)) {
            throw new ResponseError(ErrorCode.ADMIN_PASSWORD_ERROR);
        }
        user.password = newUser.password;
        user.loginName = newUser.loginName;
        user.nickName = newUser.nickName;
        user.role = USER_ROLE.ADMIN;
        await this.__userRepository.save(user);
        return true;
    }

    async updateUser(auth: COTCore.AdminAuthInfo, dto: COTCore.Api.Admin.User.UpdateUserReqDto) {
        const { oldPassword, newPassword } = dto;
        const user = await this.__userRepository.findOneForce({ where: { loginName: auth.loginName } });
        // 校验密码
        if (oldPassword) {
            if (!CommonHelper.isVaildSHA256(oldPassword)) {
                throw new ResponseError(ErrorCode.ADMIN_PASSWORD_ERROR);
            }
            if (oldPassword !== user.password) {
                throw new ResponseError(ErrorCode.ADMIN_OLD_PASSWORD_ERROR);
            }
            if (newPassword) {
                if (!CommonHelper.isVaildSHA256(newPassword)) {
                    throw new ResponseError(ErrorCode.ADMIN_PASSWORD_ERROR);
                }
                user.password = newPassword;
            }
        }

        return await this.__userRepository.save(user);
    }

    async deleteUser() {}

    async getUserById(userId: number) {
        return await this.__userRepository.findOneBy({ id: userId, status: USER_STATUS.START });
    }

    /**
     * 用户操作查询
     * @param dto
     */
    async getOperateRecordList(dto: COTCore.Api.Admin.User.GetOperateRecordListReqDto) {
        const { loginName, api, page, pageSize } = dto;
        const where: FindOptionsWhere<OperateRecordEntity> = {};
        if (loginName) {
            where.loginName = loginName;
        }
        if (api) {
            where.api = api;
        }
        const operateRecordList = await this.__operateRecordRepository.findByPageNormal(
            {
                where,
            },
            page,
            pageSize,
        );
        return operateRecordList;
    }

    async saveOperateRecord(dto: Omit<OperateRecordEntity, "version" | "updatedTime" | "createdTime" | "id" | "result">) {
        const operateRecord = new OperateRecordEntity();
        operateRecord.loginName = dto.loginName;
        operateRecord.api = dto.api;
        operateRecord.data = JSON.stringify(dto.data);
        operateRecord.version = process.env["VERSION"] as string;
        operateRecord.result = false;
        await this.__operateRecordRepository.save(operateRecord);
        return operateRecord;
    }

    async operateRecordSuccess(operateRecord: OperateRecordEntity) {
        operateRecord.result = true;
        await this.__operateRecordRepository.save(operateRecord);
    }
}
