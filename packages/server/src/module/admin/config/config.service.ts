import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { GlobalValueRedisRepository } from "../../redis/global-value.redis-repository.js";
import { OrderHelper } from "../../../helper/index.js";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { Logger } from "@bnqkl/wallet-sdk";
import { RechargeClassDefine } from "../dto/config.dto.js";
import type { ExternalChainName } from "@bnqkl/cot-core";

@Injectable()
export class ConfigService {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    async setRecharge(rechargeConfig: COTCore.Config.BusinessConfig["recharge"]) {
        try {
            // 校验config合法性
            // 校验各个price及targetAsset的价格包含在价格配置中。

            const checkConfig: RechargeClassDefine = plainToClass(RechargeClassDefine, rechargeConfig);
            await validate(checkConfig).then((errors) => {
                if (errors.length > 0) {
                    throw new Error(`config validate error: ${errors}`);
                }
            });

            for (const chainName in rechargeConfig) {
                for (const assetType in rechargeConfig[chainName]) {
                    const item = rechargeConfig[chainName][assetType];
                    for (const _chain in item.supportChain) {
                        const externalItem = item.supportChain[_chain as keyof typeof item.supportChain]!
                        if (externalItem.contract) {
                            const contractTokenInfo = await OrderHelper.getContractTokenInfo(chainName as ExternalChainName, externalItem.contract);
                            externalItem.assetType = contractTokenInfo.symbol;
                        }
                    }
                }
            }

            return await this.__globalValueRedisRepository.saveConfigByKey(rechargeConfig, "recharge");
        } catch (error: any) {
            Logger.warn(error);
            throw new Error(error.message);
        } finally {
        }
    }
}
