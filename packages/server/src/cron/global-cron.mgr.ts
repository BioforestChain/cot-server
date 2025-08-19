import { Logger } from "@bnqkl/wallet-sdk";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { GlobalValueRedisRepository } from "../module/redis/index.js";

@Injectable()
export class GlobalCronMgr {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    protected __globalValueRedisRepository!: GlobalValueRedisRepository;
    start() {
        this.__init();
    }

    private async __init() {
        try {
            // 内网环境 如果今天都没取快照 那就直接取一份现在快照当今天的使用
            // 或者如果配置了运行即初始化，那就取一份当前快照 给今天用 (防止快照失败时 已经过了时间点)
            // }
        } catch (error) {
            Logger.warn(error);
        }
    }
}
