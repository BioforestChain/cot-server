import type { OnModuleInit } from "@nestjs/common";
import { forwardRef, Inject } from "@nestjs/common";
import { GlobalValueRedisRepository } from "../../module/redis/global-value.redis-repository.js";
import { BaseApp } from "../app.js";

export class WebApp extends BaseApp implements OnModuleInit {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    async onModuleInit() {
        await this.start();
    }
}
