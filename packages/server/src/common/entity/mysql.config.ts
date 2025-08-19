import type { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { staticConfig } from "../../config/index.js";
import { OperateRecordEntity } from "./admin/operate-record.entity.js";
import { UserEntity } from "./admin/user.entity.js";
import { RechargeOrder } from "./recharge/recharge-order.entity.js";
import { RedemptionOrder } from "./redemption/redemption-order.entity.js";

const { host, port, username, password, dbName } = staticConfig.mysql;
export const mysqlConfig: TypeOrmModuleAsyncOptions = {
    useFactory: () => ({
        type: "mysql",
        host,
        port,
        username,
        password,
        database: dbName,
        entities: [RechargeOrder, RedemptionOrder, UserEntity, OperateRecordEntity],
        // autoLoadEntities: true,
        // logging: true,
        maxQueryExecutionTime: 1000,
        bigNumberStrings: false,
    }),
};
