import { Injectable } from "@nestjs/common";
import { RechargeOrder } from "../../common/index.js";
import type { DataSource } from "typeorm";
import { BaseRepository } from "@bnqkl/wallet-sdk";

@Injectable()
export class RechargeOrderRepository extends BaseRepository<RechargeOrder> {
    constructor(dataSource: DataSource) {
        super(RechargeOrder, dataSource);
    }
}
