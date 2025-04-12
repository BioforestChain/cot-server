import { forwardRef, Inject, OnModuleInit } from "@nestjs/common";
import { GlobalValueRedisRepository } from "../../module/redis/global-value.redis-repository";
import { BaseApp } from "../app";

export class WebApp extends BaseApp implements OnModuleInit {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    async onModuleInit() {
        await this.start();
    }
}
