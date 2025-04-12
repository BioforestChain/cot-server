import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { sleep, Logger, EXTERNAL_TRANS_RETRY_INVERVAL, EXTERNAL_TRANS_RETRY_MAX_NUM } from "@bnqkl/wallet-sdk";
import { LOCAL_MQ_ID, ORDER_TEMP_QUEUE_ROUTING_KEY, TRANSACTION_LINK_TYPE } from "../../../../../common";
import { RedemptionHelper, walletServerSdk } from "../../../../../helper";
import { RedemptionOrderObj } from "../../redemption-order-obj";
import { ExternalChainName, REDEMPTION_ORDER_STATE_ID } from "@cot/core";
import { businessPublisher } from "../../../../mq";
import { RedemptionOrderPendingState } from "../redemption-order-pending.state";
import { GlobalValueRedisRepository } from "../../../../redis/global-value.redis-repository";

/**等待外链上链状态 */
@Injectable()
export class ExternalWaitOnChain_RedemptionOrderState extends RedemptionOrderPendingState {
    @Inject(forwardRef(() => GlobalValueRedisRepository))
    private __globalValueRedisRepository!: GlobalValueRedisRepository;

    constructor() {
        super(REDEMPTION_ORDER_STATE_ID.EXTERNAL_WAIT_ON_CHAIN);
    }

    /**
     * 心跳
     * @param orderObj
     */
    async onTick(orderObj: RedemptionOrderObj): Promise<void> {
        // 重试接收方转账
        if (orderObj.retryToTxStamp && Date.now() >= orderObj.retryToTxStamp) {
            orderObj.retryToTxStamp = undefined;
            await businessPublisher.publishOrderEvent(ORDER_TEMP_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_TO_TX_START, { orderId: orderObj.orderId }, true);
        }
    }

    /**
     * 进入状态
     * @param orderObj
     */
    async onEnterState(orderObj: RedemptionOrderObj): Promise<void> {
        if (await RedemptionHelper.isRedemptionDevTest()) {
            // 赎回开发测试时，外链直接成功
            Logger.debug(`<${orderObj.orderType}> orderId:${orderObj.orderId} 外链事件跳过，上链成功`);
            await orderObj.changeState(REDEMPTION_ORDER_STATE_ID.SUCCESS, this.getStateId());
            return;
        }
        await businessPublisher.publishOrderEvent(ORDER_TEMP_QUEUE_ROUTING_KEY.REDEMPTION_ORDER_TO_TX_START, { orderId: orderObj.orderId }, true);
    }

    /**
     * 开始接收方交易上链回调
     * @param orderObj
     */
    async onToTxStartCallback(orderObj: RedemptionOrderObj): Promise<void> {
        await this.__startTransfer(orderObj);
    }

    /**
     * 开始外链转账
     * @param orderObj
     */
    private async __startTransfer(orderObj: RedemptionOrderObj) {
        const { orderId, internalChain, internalAddress, walletChain, walletTxId, walletAddress, walletAmount, walletAsset, contractAddress } = orderObj;
        if (walletTxId === orderId) {
            try {
                // 外链平台账户
                const platformAccount = this.__globalValueRedisRepository.forceGetExternalKeypair(walletChain, walletAsset);
                // if (!contractAddress) {
                //     throw Error(`__startTransfer contractAddress is undefined`);
                // }
                const resp = await walletServerSdk.createExternalTransfer({
                    chainName: walletChain,
                    account: platformAccount,
                    recipientId: walletAddress,
                    contractAddress,
                    amount: walletAmount,
                    param: {
                        mqId: LOCAL_MQ_ID,
                        linkType: TRANSACTION_LINK_TYPE.REDEMPTION_ORDER,
                        linkId: orderId,
                    },
                });
                Logger.debug(`[${walletChain}] __startTransfer. txId:${resp.txId}`);
                orderObj.walletTxId = resp.txId;
                await orderObj.save();
            } catch (e) {
                // 未注入私钥，或发起账户余额不足，在队列外等待，卡住其他的消费者，降低并发
                if (walletChain !== ExternalChainName.TRON) {
                    // eth和bsc交易体生成失败，大概率是nonce的原因
                    const forgeInterval = await walletServerSdk.getExternalForgeInterval({ chainName: walletChain });
                    await sleep(forgeInterval * 1000);
                } else {
                    await sleep(EXTERNAL_TRANS_RETRY_INVERVAL);
                }
                throw e;
            }
        }
        await walletServerSdk.createExternalTransObj({ chainName: walletChain, txId: orderObj.walletTxId });
    }

    /**
     * 校验交易hash
     * @param orderObj
     * @param txId
     */
    private __verifyTxId(orderObj: RedemptionOrderObj, txId: string) {
        if (txId !== orderObj.walletTxId) {
            throw Error(`txId:${txId} !== orderObj.txHash:${orderObj.walletTxId}`);
        }
    }

    /**
     * 外链上链成功回调
     * @param orderObj
     * @param trans
     */
    async onExternalChainSuccessCallback(orderObj: RedemptionOrderObj, trans: WalletTypings.ExternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        await orderObj.changeState(REDEMPTION_ORDER_STATE_ID.SUCCESS, this.getStateId());
    }

    /**
     * 外链上链失败回调
     * @param orderObj
     * @param trans
     */
    async onExternalChainFailCallback(orderObj: RedemptionOrderObj, trans: WalletTypings.ExternalChain.TransactionBase): Promise<void> {
        this.__verifyTxId(orderObj, trans.entityId);
        // 接收方转账必须成功，否则不断重试
        await this.__retryToTx(orderObj);
    }

    /**
     * 重试接收方转账
     * @param orderObj
     */
    private async __retryToTx(orderObj: RedemptionOrderObj) {
        // 刷新重试时间戳
        orderObj.retryToTxStamp = Date.now() + EXTERNAL_TRANS_RETRY_INVERVAL;
        orderObj.walletTxId = orderObj.orderId;
        orderObj.retryToTxNum++;
        // 立即保存
        await orderObj.save();
        const txNum = orderObj.retryToTxNum;
        if (txNum <= EXTERNAL_TRANS_RETRY_MAX_NUM) {
            return;
        }
        // 超过最大重试次数
        Logger.error(`<${orderObj.orderType}>:${orderObj.orderId} txNum:${txNum} is over ${EXTERNAL_TRANS_RETRY_MAX_NUM}`);
        // 进入失败状态
        await orderObj.changeState(REDEMPTION_ORDER_STATE_ID.EXTERNAL_ON_CHAIN_FAIL, this.getStateId());
    }
}
