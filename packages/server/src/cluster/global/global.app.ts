import type { OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { GlobalCronMgr } from "../../cron/global-cron.mgr.js";
import { GLOBAL_INITING, redisCore } from "@bnqkl/wallet-sdk";
import { BaseApp } from "../app.js";
import { UpgradeService } from "../../module/upgrade/upgrade.service.js";

@Injectable()
export class GlobalApp extends BaseApp implements OnModuleInit, OnApplicationBootstrap {
    @Inject(forwardRef(() => UpgradeService))
    private __upgradeService!: UpgradeService;
    @Inject(forwardRef(() => GlobalCronMgr))
    private __globalCronMgr!: GlobalCronMgr;

    async onModuleInit() {
        await this.start();
        await this.__upgradeService.upgrade();
        // 启动定时任务
        this.__globalCronMgr.start();
    }

    async onApplicationBootstrap() {
        await redisCore.redis.del(GLOBAL_INITING);
    }
}
