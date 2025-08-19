import type { INestApplication} from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import helmet from "helmet";
import type http from "node:http";
import { AllExceptionFilter, CHAIN_NETWORK_TYPE, CommonTransformIterceptor, Logger, redisCore } from "@bnqkl/wallet-sdk";
import { staticConfig } from "../config/index.js";
import { VERSION } from "../common/index.js";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { GLOBAL_PREFIX } from "@bnqkl/cot-core";
export abstract class BaseWorker {
    server!: http.Server;
    /**
     * nestModule的初始化
     * @param app
     */
    async initAppModule(app: NestExpressApplication) {
        app.use(`/${GLOBAL_PREFIX}/verify`, express.json({ limit: "50mb" }));
        app.use(`/${GLOBAL_PREFIX}/verify`, express.urlencoded({ limit: "50mb", extended: true }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        // 跨域处理
        app.enableCors();
        // XSS 安全预防
        app.use(helmet.xssFilter());
        // iframe 访问策略，预防点击劫持
        app.use(helmet.frameguard());
        // 隐藏 X-Powered-By 头信息
        app.use(helmet.hidePoweredBy());
        // 静止MIME类型嗅探
        app.use(helmet.noSniff());
        const LIMIT_INTERVAL = staticConfig.apiLimit.limitInterval || 1 * 60 * 1000;
        const MAX_REQUEST = staticConfig.apiLimit.maxRequest || 60;

        // 单IP速率限制（预防单IP当了请求攻击，暂用于访问过多限制）
        app.set("trust proxy", true);
        const limiter = rateLimit({
            windowMs: LIMIT_INTERVAL, // 1分钟
            max: MAX_REQUEST, // 将每个IP限制为 每个 'window' 100个请求
            message: "Too Many Request From This Ip",
            skip: (req, res) => {
                const ipV4 = req.ip ? req.ip.replace("::ffff:", "") : "";
                return (staticConfig.apiLimit.whiteList || []).includes(ipV4);
            },
        });
        app.use(`/${GLOBAL_PREFIX}`, limiter);
        await redisCore.connect(staticConfig.redis.server);
        app.setGlobalPrefix(GLOBAL_PREFIX);
        // 添加全局验证管道
        app.useGlobalPipes(new ValidationPipe({ enableDebugMessages: true, transform: true }));
        // 全局异常过滤器
        app.useGlobalFilters(new AllExceptionFilter());

        app.useGlobalInterceptors(new CommonTransformIterceptor());
        if (staticConfig.docs) {
            const config = new DocumentBuilder()
                .setTitle("Meta Box Doc")
                .setDescription("API description")
                .setVersion(VERSION)
                .addBearerAuth(
                    {
                        description: "add header",
                        name: "Authorization",
                        type: "http",
                        in: "Header",
                        bearerFormat: "Bearer",
                    },
                    "access-token",
                )
                .addSecurityRequirements("access-token")
                .addTag("Meta Box")
                .build();
            const document = SwaggerModule.createDocument(app, config);
            SwaggerModule.setup("api", app, document);
        }
        await this.serverListen(app);
    }

    abstract getHttpPort(): number | undefined;

    async serverListen(app: INestApplication) {
        const port = this.getHttpPort();
        if (port !== undefined) {
            // Start Webserver
            this.server = await app.listen(port, () => {
                Logger.info(`Server Started! listening: ${port}`);
            });
        } else {
            await app.init();
        }
    }
}
