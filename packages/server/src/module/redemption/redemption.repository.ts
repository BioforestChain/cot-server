import { Injectable } from "@nestjs/common";
import { RedemptionOrder } from "../../common";
import { DataSource } from "typeorm";
import { BaseRepository } from "@bnqkl/wallet-sdk";

@Injectable()
export class RedemptionOrderRepository extends BaseRepository<RedemptionOrder> {
    constructor(dataSource: DataSource) {
        super(RedemptionOrder, dataSource);
    }
}
