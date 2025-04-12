import { Column, Entity, DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BaseEntity, BaseRepository } from "@bnqkl/wallet-sdk";
import { USER_ROLE } from "@cot/core";

@Entity("user")
export class UserEntity extends BaseEntity {
    @Column({ name: "login_name", comment: "登录名称" })
    loginName: string;
    @Column({ name: "password", comment: "密码" })
    password: string;
    @Column({ name: "nick_name", comment: "昵称" })
    nickName: string;
    @Column({ name: "mobile", comment: "手机号" })
    mobile: string;
    @Column({ name: "email", comment: "电子邮箱" })
    email: string;
    @Column({ name: "login_time", type: "datetime", comment: "登录时间" })
    loginTime: Date;
    @Column({ name: "status", type: "int", comment: "状态(0:停用,1:启用)" })
    status: number;
    @Column({ name: "role", type: "int", comment: "权限角色" })
    role: USER_ROLE;
}

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
    constructor(dataSource: DataSource) {
        super(UserEntity, dataSource);
    }
}
