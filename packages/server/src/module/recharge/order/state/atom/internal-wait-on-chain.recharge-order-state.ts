import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {
    CommonHelper,
    sleep,
    Logger,
    ChainHelper,
    InternalMainAssetType,
    InternalAssetType,
    INTERNAL_TRANS_RETRY_INVERVAL,
    INTERNAL_TRANS_RETRY_MAX_NUM,
} from "@bnqkl/wallet-sdk";
import { GLOBAL_VALUE_ENTITY_ID, LOCAL_MQ_ID, ORDER_TEMP_QUEUE_ROUTING_KEY, RECHARGE_HKEY, TRANSACTION_LINK_TYPE } from "../../../../../common";
import { OrderHelper, RechargeHelper, walletServerSdk } from "../../../../../helper";
import { MemoryService } from "../../../../../module/memory/memory.service";
import { RechargeOrderObj } from "../../recharge-order-obj";
import { INTERNAL_CHAIN_RW_ACCOUNT_TYPE, RECHARGE_ORDER_STATE_ID, RECHARGE_TYPE } from "@bnqkl/cotcore";
import { businessPublisher } from "../../../../mq";
import { RechargeOrderPendingState } from "../recharge-order-pending.state";
import { GlobalValueRedisRepository } from "../../../../redis";

/**等待内链上链状态 */
@Injectable()
export class InternalWaitOnChain_RechargeOrderState extends RechargeOrderPendingState {
    @Inject(forwardRef(() => MemoryService))
    private __memoryService!: MemoryService;
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    constructor() {
        super(RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN);
    }

    /**
     * 心跳
     * @param orderObj
     */
    async onTick(orderObj: RechargeOrderObj): Promise<void> {
        if (orderObj.retryRechargeTxStamp && Date.now() >= orderObj.retryRechargeTxStamp) {
            orderObj.retryRechargeTxStamp = undefined;
            const accountType = INTERNAL_CHAIN_RW_ACCOUNT_TYPE.RECHARGEV2_ACCOUNT;
            await businessPublisher.publishOrderEvent(
                ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TRY_TRANSFER,
                { orderId: orderObj.orderId, params: { accountType } },
                true,
            );
        }
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RechargeOrderObj): Promise<void> {
        // 等待mq内链上链相关队列初始化完毕
        this.__memoryService.waitInternalOnChainQueueInited().then(async () => {
            if (orderObj.curStateId !== RECHARGE_ORDER_STATE_ID.INTERNAL_WAIT_ON_CHAIN) {
                // 已更新到最新高度，但state已经不是internalWaitOnChain，说明同步完成后本订单已经上链成功或失败，直接跳过本状态
                return;
            }
            await businessPublisher.publishOrderEvent(ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TO_TX_START, { orderId: orderObj.orderId }, true);
        });
    }

    /**
     * 开始接收方交易上链回调
     * @param orderObj
     */
    async onToTxStartCallback(orderObj: RechargeOrderObj): Promise<void> {
        const { rechargeAmount, isRechargeTxFinish, rechargeType } = orderObj;
        // 尝试转账
        if (BigInt(rechargeAmount) > BigInt(0) && !isRechargeTxFinish) {
            await businessPublisher.publishOrderEvent(
                ORDER_TEMP_QUEUE_ROUTING_KEY.RECHARGE_ORDER_TRY_TRANSFER,
                {
                    orderId: orderObj.orderId,
                    params: {
                        accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE.RECHARGEV2_ACCOUNT,
                    },
                },
                true,
            );
        }
    }

    /**
     * 尝试内链转账回调
     * @param orderObj
     * @param accountType
     */
    async onInternalChainTryTransferCallback(orderObj: RechargeOrderObj, accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE): Promise<void> {
        await this.__startTransfer(orderObj, accountType);
    }

    /**
     * 开始内链转账
     * @param orderObj
     */
    private async __startTransfer(orderObj: RechargeOrderObj, accountType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE) {
        const { orderId, internalChain, internalAddress, rechargeTxId, rechargeAmount, isRechargeTxFinish, rechargeType, rechargeAssetType } = orderObj;
        const amount = rechargeAmount;
        if (BigInt(amount) === BigInt(0)) {
            return;
        }
        const isFinish = isRechargeTxFinish;
        if (isFinish) {
            return;
        }
        let txId = rechargeTxId;
        if (txId === orderId) {
            try {
                if (rechargeType === RECHARGE_TYPE.ISSUE) {
                    const recharge = await this.__globalValueRedisRepository.getConfigByKeyForce("recharge");
                    // 主币种平台账户私钥
                    const platformSecret = this.__memoryService.forceGetRWKeypair(
                        `${INTERNAL_CHAIN_RW_ACCOUNT_TYPE.RECHARGEV2_ACCOUNT}_${internalChain}_${rechargeAssetType}`,
                    ).secret;
                    const rechargeItem = RechargeHelper.checkChainAssetItem(recharge, internalChain, rechargeAssetType);
                    const resp = await walletServerSdk.createInternalIncreaseAsset({
                        chainName: internalChain,
                        secret: platformSecret,
                        recipientId: internalAddress,
                        assetInfo: {
                            increasedAssetPrealnum: amount.toString(),
                            assetType: rechargeAssetType,
                            applyAddress: rechargeItem.applyAddress,
                        },
                        param: {
                            mqId: LOCAL_MQ_ID,
                            linkType: TRANSACTION_LINK_TYPE.RECHARGE_ORDER,
                            linkId: orderId,
                        },
                    });
                    orderObj.rechargeTxId = resp.txId;
                    // 立即保存
                    await orderObj.save();
                    txId = resp.txId;
                } else if (rechargeType === RECHARGE_TYPE.AIRDROP) {
                    // 主币种平台账户私钥
                    const platformSecret = this.__memoryService.forceGetRWKeypair(INTERNAL_CHAIN_RW_ACCOUNT_TYPE.AIRDROP_ACCOUNT).secret;
                    const resp = await walletServerSdk.createInternalTransfer({
                        chainName: internalChain,
                        secret: platformSecret,
                        recipientId: internalAddress,
                        assetType: rechargeAssetType,
                        /**转账数量 */
                        amount: rechargeAmount.toString(),
                        param: {
                            mqId: LOCAL_MQ_ID,
                            linkType: TRANSACTION_LINK_TYPE.RECHARGE_ORDER,
                            linkId: orderId,
                        },
                    });
                    orderObj.rechargeTxId = resp.txId;
                    // 立即保存
                    await orderObj.save();
                    txId = resp.txId;
                } else {
                    throw Error(`not support this rechargeType ${rechargeType}`);
                }
            } catch (e) {
                // 未注入私钥，或发起账户余额不足，或生成交易体失败（可能是maker繁忙），在队列外等待，卡住其他的消费者，降低并发
                await sleep(INTERNAL_TRANS_RETRY_INVERVAL);
                throw e;
            }
        }
        await walletServerSdk.createInternalTransObj({ chainName: internalChain, txId });
    }

    /**
     * 校验交易id
     * @param orderObj
     * @param txId
     */
    private __verifyTxId(orderObj: RechargeOrderObj, txId: string) {
        if (txId !== orderObj.rechargeTxId) {
            throw Error(`txId:${txId}  orderObj.rechargeTxId:${orderObj.rechargeTxId}`);
        }
    }

    /**
     * 内链上链成功回调
     * @param orderObj
     * @param trans
     */
    async onInternalChainSuccessCallback(orderObj: RechargeOrderObj, trans: WalletTypings.InternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        if (orderObj.rechargeTxId === trans.entityId) {
            orderObj.rechargeTxOnChain = true;
        }
        // 立即保存
        await orderObj.save();
        if (orderObj.rechargeTxOnChain) {
            // 上链后，转为成功状态
            await orderObj.changeState(RECHARGE_ORDER_STATE_ID.SUCCESS, this.getStateId());
        }
    }

    /**
     * 内链上链失败回调
     * @param orderObj
     * @param trans
     */
    async onInternalChainFailCallback(orderObj: RechargeOrderObj, trans: WalletTypings.InternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        // 接收方转账必须成功，否则不断重试
        if (orderObj.rechargeTxId === trans.entityId) {
            await this.__retryToTx(orderObj, INTERNAL_CHAIN_RW_ACCOUNT_TYPE.RECHARGEV2_ACCOUNT);
        }
    }

    /**
     * 重试接收方转账
     * @param orderObj
     * @param assetType
     */
    private async __retryToTx(orderObj: RechargeOrderObj, assetType: INTERNAL_CHAIN_RW_ACCOUNT_TYPE) {
        // 刷新重试时间戳
        orderObj.retryRechargeTxStamp = Date.now() + INTERNAL_TRANS_RETRY_INVERVAL;
        orderObj.rechargeTxId = orderObj.orderId;
        orderObj.retryRechargeTxNum++;
        // 立即保存
        await orderObj.save();
        const txNum = orderObj.retryRechargeTxNum;
        if (txNum <= INTERNAL_TRANS_RETRY_MAX_NUM) {
            return;
        }
        // 超过最大重试次数
        Logger.error(`<${orderObj.orderType}>:${orderObj.orderId} txNum:${txNum} is over ${INTERNAL_TRANS_RETRY_MAX_NUM}`);
        if (orderObj.isRechargeTxFinish) {
            // 进入失败状态
            await orderObj.changeState(RECHARGE_ORDER_STATE_ID.INTERNAL_ON_CHAIN_FAIL, this.getStateId());
        }
    }
}
