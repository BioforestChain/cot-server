import { Injectable } from "@nestjs/common";
import { CMD, WORKER } from "../../common";
import { ipcHelpers, ProcessCheck, bfmetaSignUtil, walletSdk } from "../../helper";
import { Logger } from "@bnqkl/wallet-sdk";
import { PromiseOut } from "@bnqkl/util-node";

@Injectable()
export class MemoryService {
    constructor() {
        const k = process.env["serverKey"];
        if (k) {
            bfmetaSignUtil.createKeypair(k).then((v) => {
                this.__serverKeyPair.resolve(v);
            });
        }
    }

    private __serverKeyPair = new PromiseOut<BFMetaSignUtil.Keypair>();
    async getServerKeypair() {
        return this.__serverKeyPair.promise;
    }

    /**充值提现池 */
    private __rwkeypairMap = new Map<string, COTCore.Verify.AccountType>();
    setRWKeypair(accountType: string, keypair: COTCore.Verify.AccountType) {
        ProcessCheck.checkInOrderWorker();
        if (this.__rwkeypairMap.has(accountType)) {
            Logger.warn(` ${accountType} has been set`);
            return false;
        } else {
            this.__rwkeypairMap.set(accountType, keypair);
            return true;
        }
    }

    getAllRWKeypair() {
        ProcessCheck.checkInOrderWorker();
        return this.__rwkeypairMap.entries();
    }

    forceGetRWKeypair(accountType: string) {
        ProcessCheck.checkInOrderWorker();
        const keypair = this.__rwkeypairMap.get(accountType);
        if (keypair) {
            return keypair;
        } else {
            throw new Error(`${accountType} is not inject`);
        }
    }

    async injectRWAddress(accountType: string, keypairStr: string): Promise<boolean> {
        if (process.env["workerName"] !== `${WORKER.ORDER}`) {
            return await ipcHelpers.request(`${WORKER.ORDER}`, CMD.INJECT_RW_SECRET, { accountType, keypairStr });
        }
        const clientPublicKey = process.env["clientPublicKey"] as string;
        const serverKeypair = await this.getServerKeypair();
        const keypairStrBytes = bfmetaSignUtil.asymmetricDecrypt(
            Buffer.from(keypairStr, "base64"),
            new Uint8Array(Buffer.from(clientPublicKey, "hex")),
            serverKeypair.secretKey,
        );
        if (!keypairStrBytes) {
            Logger.warn(`keypair decrypt fail`);
            return false;
        }
        try {
            const secret: string = JSON.parse(Buffer.from(keypairStrBytes).toString());
            return this.setRWKeypair(accountType, { secret, keypair: await bfmetaSignUtil.createKeypair(secret) });
        } catch (err) {
            Logger.warn(err);
            return false;
        }
    }

    async getInjectAddress(): Promise<{ [accountType: string]: string }> {
        if (process.env["workerName"] !== `${WORKER.ORDER}`) {
            return await ipcHelpers.request(`${WORKER.ORDER}`, CMD.GET_INJECT_RW_ADDRESS, {});
        }
        const addressObj: { [accountType: string]: string } = {};
        for (const [accountType, info] of this.getAllRWKeypair()) {
            addressObj[accountType] = await bfmetaSignUtil.getAddressFromSecret(info.secret);
        }
        return addressObj;
    }
    private __internalOnChainQueueInitedPromise = new PromiseOut<void>();
    /**
     * 等待mq内链上链相关队列初始化完毕
     */
    waitInternalOnChainQueueInited() {
        return this.__internalOnChainQueueInitedPromise.promise;
    }

    /**
     * 设置mq内链上链相关队列初始化完毕
     */
    setInternalOnChainQueueInited() {
        return this.__internalOnChainQueueInitedPromise.resolve();
    }
}
