import { InternalAssetType, Logger, rabbitMQCore, sleep, TRANS_QUEUE_ROUTING_KEY } from "@bnqkl/wallet-sdk";
import { ExternalAssetType, ExternalChainName, InternalChainName, INTERNAL_CHAIN_RW_ACCOUNT_TYPE } from "@bnqkl/cotcore";
import { forwardRef, Inject, OnModuleInit } from "@nestjs/common";
import { CMD, LOCAL_MQ_ID, TRANSACTION_LINK_TYPE } from "../../common";
import { bfmetaSignUtil, ipcHelpers, walletConsumer, walletSdk, walletServerSdk } from "../../helper";
import { MemoryService } from "../../module/memory/memory.service";
import { RechargeOrderMgr } from "../../module/recharge/order/recharge-order-mgr";
import { RedemptionOrderMgr } from "../../module/redemption/order/redemption-order-mgr";
import { GlobalValueRedisRepository } from "../../module/redis/global-value.redis-repository";
import { BaseApp } from "../app";

export class OrderApp extends BaseApp implements OnModuleInit {
    @Inject(forwardRef(() => MemoryService))
    private __memoryService!: MemoryService;
    @Inject(forwardRef(() => RechargeOrderMgr))
    private __rechargeOrderMgr!: RechargeOrderMgr;
    @Inject(forwardRef(() => RedemptionOrderMgr))
    private __redemptionOrderMgr!: RedemptionOrderMgr;
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    async onModuleInit() {
        await this.start();
        /**开发环境才默认注入私钥 */
        if (process.env.NODE_ENV === "dev") {
            await this.__testInjectAddress();
        } else {
            const config = await this.__globalValueRedisRepository.getConfig();
            const rechargeConfig = config.recharge;
            if (rechargeConfig) {
                for (const _c in rechargeConfig) {
                    for (const _a in rechargeConfig[_c]) {
                        // const chain
                        const supportChain = rechargeConfig[_c][_a].supportChain;
                        if (supportChain.BSC) {
                            const account = await this.__globalValueRedisRepository.initExternalAccount(ExternalChainName.BSC, supportChain.BSC.assetType);
                            supportChain.BSC.depositAddress = account.address;
                        }
                        if (supportChain.ETH) {
                            const account = await this.__globalValueRedisRepository.initExternalAccount(ExternalChainName.ETH, supportChain.ETH.assetType);
                            supportChain.ETH.depositAddress = account.address;
                        }
                        if (supportChain.TRON) {
                            const account = await this.__globalValueRedisRepository.initExternalAccount(ExternalChainName.TRON, supportChain.TRON.assetType);
                            supportChain.TRON.depositAddress = await walletSdk.walletFactory.TronApi.addressToHex(account.address);
                        }
                    }
                }
                this.__globalValueRedisRepository.saveConfig(config);
            }
        }
        // 处理mq任务
        await this.__processMqTask();
        // orderMgr初始化
        await this.__orderMgrInit();
    }

    async __testInjectAddress() {
        const serverPublicKey = await bfmetaSignUtil.getPublicKeyBySecret(process.env["serverKey"] as string);
        const pmcKeypairStr = await bfmetaSignUtil.encryptData(
            "nose install correct solar side latin focus churn mask nominee differ mosquito claw awake glass rare pond clump draw rent fiction muscle razor bacon",
            "clientKey",
            serverPublicKey,
        );
        const usdtKeypairStr = await bfmetaSignUtil.encryptData("test_usdt", "clientKey", serverPublicKey);
        await this.__memoryService.injectRWAddress(`${INTERNAL_CHAIN_RW_ACCOUNT_TYPE.AIRDROP_ACCOUNT}`, pmcKeypairStr);

        await this.__memoryService.injectRWAddress(
            `${INTERNAL_CHAIN_RW_ACCOUNT_TYPE.RECHARGEV2_ACCOUNT}_${InternalChainName.BIWMETA}_${InternalAssetType.USDT}`,
            usdtKeypairStr,
        );

        await this.__globalValueRedisRepository.injectExternalAddress(
            ExternalChainName.ETH,
            ExternalAssetType.USDT,
            await bfmetaSignUtil.encryptData("demand stuff prevent suffer squeeze float pluck enemy tank you solution senior", "clientKey", serverPublicKey),
        );
        await this.__globalValueRedisRepository.injectExternalAddress(
            ExternalChainName.BSC,
            ExternalAssetType.USDT,
            await bfmetaSignUtil.encryptData("express slam merit craft victory dumb priority dog illness rail eyebrow apology", "clientKey", serverPublicKey),
        );
        await this.__globalValueRedisRepository.injectExternalAddress(
            ExternalChainName.TRON,
            ExternalAssetType.USDT,
            await bfmetaSignUtil.encryptData("express slam merit craft victory dumb priority dog illness rail eyebrow apology", "clientKey", serverPublicKey),
        );
    }

    /**
     * 处理mq任务
     */
    private async __processMqTask() {
        this.__rechargeOrderMgr.processMqTask();
        this.__redemptionOrderMgr.processMqTask();
        rabbitMQCore.on("connect", () => {
            // 处理外链上链
            this.__processExternalOnChain();
            // 处理内链上链
            this.__processInternalOnChain();
        });
    }

    /**
     * 处理外链上链
     */
    private __processExternalOnChain(): void {
        const __onExternalChainCallback = async (status: boolean, trans: WalletTypings.ExternalChain.TransactionBase) => {
            switch (trans.linkType) {
                case TRANSACTION_LINK_TYPE.RECHARGE_ORDER:
                    await this.__rechargeOrderMgr.onExternalChainCallback(status, trans);
                    break;
                case TRANSACTION_LINK_TYPE.REDEMPTION_ORDER:
                    await this.__redemptionOrderMgr.onExternalChainCallback(status, trans);
                    break;
                default:
                    break;
            }
        };
        // 处理外链上链成功
        walletConsumer.consumeOnChainEvent(
            TRANS_QUEUE_ROUTING_KEY.EXTERNAL_SUCCESS,
            async ({ chainName, entityId }) => {
                const trans = await walletServerSdk.getExternalTrans({ chainName: chainName as ExternalChainName, txId: entityId });
                await __onExternalChainCallback(true, trans);
            },
            LOCAL_MQ_ID,
        );
        // 处理外链上链失败
        walletConsumer.consumeOnChainEvent(
            TRANS_QUEUE_ROUTING_KEY.EXTERNAL_FAIL,
            async ({ chainName, entityId }) => {
                const trans = await walletServerSdk.getExternalTrans({ chainName: chainName as ExternalChainName, txId: entityId });
                await __onExternalChainCallback(false, trans);
            },
            LOCAL_MQ_ID,
        );
    }

    /**
     * 处理内链上链
     */
    private __processInternalOnChain(): void {
        const __onInternalChainCallback = async (status: boolean, trans: WalletTypings.InternalChain.TransactionBase) => {
            switch (trans.linkType) {
                case TRANSACTION_LINK_TYPE.RECHARGE_ORDER:
                    await this.__rechargeOrderMgr.onInternalChainCallback(status, trans);
                    break;
                case TRANSACTION_LINK_TYPE.REDEMPTION_ORDER:
                    await this.__redemptionOrderMgr.onInternalChainCallback(status, trans);
                    break;
                default:
                    break;
            }
        };
        // 处理内链上链成功
        walletConsumer.consumeOnChainEvent(
            TRANS_QUEUE_ROUTING_KEY.INTERNAL_SUCCESS,
            async ({ chainName, entityId }) => {
                const trans = await walletServerSdk.getInternalTrans({ chainName: chainName as InternalChainName, txId: entityId });
                await __onInternalChainCallback(true, trans);
            },
            LOCAL_MQ_ID,
        );
        // 处理内链上链失败
        walletConsumer.consumeOnChainEvent(
            TRANS_QUEUE_ROUTING_KEY.INTERNAL_FAIL,
            async ({ chainName, entityId }) => {
                const trans = await walletServerSdk.getInternalTrans({ chainName: chainName as InternalChainName, txId: entityId });
                await __onInternalChainCallback(false, trans);
            },
            LOCAL_MQ_ID,
        );
    }

    /**
     * orderMgr初始化
     */
    async __orderMgrInit() {
        await this.__rechargeOrderMgr.init();
        await this.__redemptionOrderMgr.init();
        // mq要等init后再连接
        await this.connectMq();
        // 检查mq内链上链相关队列是否初始化完毕
        this.checkInternalOnChainQueueInited();
    }

    /**
     * 检查mq内链上链相关队列是否初始化完毕
     */
    async checkInternalOnChainQueueInited() {
        while (true) {
            try {
                const successQueue = await walletConsumer.checkOnChainEventQueue(TRANS_QUEUE_ROUTING_KEY.INTERNAL_SUCCESS, LOCAL_MQ_ID);
                const failQueue = await walletConsumer.checkOnChainEventQueue(TRANS_QUEUE_ROUTING_KEY.INTERNAL_FAIL, LOCAL_MQ_ID);
                Logger.debug(`successQueue:${successQueue.messageCount} failQueue:${failQueue.messageCount}`);
                if (successQueue.messageCount === 0 && failQueue.messageCount === 0) {
                    break;
                }
            } catch (err) {
                Logger.error(err);
            }
            await sleep(1000);
        }
        this.__memoryService.setInternalOnChainQueueInited();
        Logger.info("internalOnChainQueueInited!");
    }

    async initIpc() {
        const server = await super.initIpc();
        /**注册函数 */
        ipcHelpers.register(server!, CMD.INJECT_RW_SECRET, async (header, { accountType, keypairStr }) => {
            return await this.__memoryService.injectRWAddress(accountType, keypairStr);
        });
        ipcHelpers.register(server!, CMD.GET_INJECT_RW_ADDRESS, async (header) => {
            return await this.__memoryService.getInjectAddress();
        });
        ipcHelpers.register(server!, CMD.INJECT_EXTERNAL_SECRET, async (header, { chainName, assetType, keypairStr }) => {
            return await this.__globalValueRedisRepository.injectExternalAddress(chainName, assetType, keypairStr);
        });
        ipcHelpers.register(server!, CMD.GET_INJECT_EXTERNAL_ADDRESS, async (header) => {
            return await this.__globalValueRedisRepository.getInjectExternalAddressObj();
        });
        ipcHelpers.register(server!, CMD.CREATE_RECHARGE_ORDER_OBJ, async (header, { orderId }) => {
            await this.__rechargeOrderMgr.createOrderObjById(orderId);
            return true;
        });
        ipcHelpers.register(server!, CMD.CREATE_REDEMPTION_ORDER_OBJ, async (header, { orderId }) => {
            await this.__redemptionOrderMgr.createOrderObjById(orderId);
            return true;
        });
        return server;
    }
}
