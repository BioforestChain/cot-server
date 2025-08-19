import type { DataSource } from "typeorm";
import { Column, Entity } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BaseEntity, BaseRepository } from "@bnqkl/wallet-sdk";

@Entity("operate_record")
export class OperateRecordEntity extends BaseEntity {
    @Column({ name: "login_name", comment: "操作账号" })
    loginName!: string;
    @Column({ name: "api", comment: "操作接口" })
    api!: string;
    @Column({ name: "version", comment: "版本号" })
    version!: string;
    @Column({ name: "data", comment: "操作数据" })
    data!: string;
    @Column("boolean", { name: "result", comment: "操作结果" })
    result!: boolean;
}

@Injectable()
export class OperateRecordRepository extends BaseRepository<OperateRecordEntity> {
    constructor(dataSource: DataSource) {
        super(OperateRecordEntity, dataSource);
    }
}
