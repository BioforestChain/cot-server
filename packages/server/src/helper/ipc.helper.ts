import { baseIpcHelpers, IPCHelpers } from "@bnqkl/wallet-sdk";
import { WORKER } from "../common";

export const ipcHelpers: IPCHelpers<COTServer.Cluster.IPC_Request_Function> = baseIpcHelpers;

export class ProcessCheck {
    /**
     * 检测是否运行在global进程，不是的话报错
     *
     * @returns
     */
    static checkInGlobalWorker() {
        if (process.env["workerName"] !== WORKER.GLOBAL) {
            throw Error("checkInGlobalWorker fail");
        }
    }

    /**
     * 检测是否运行在business进程，不是的话报错
     *
     * @returns
     */
    static checkInBusinessWorker() {
        if (process.env["workerName"] !== WORKER.BUSINESS) {
            throw Error("checkInBusinessWorker fail");
        }
    }

    /**
     * 检测是否运行在order进程，不是的话报错
     *
     * @returns
     */
    static checkInOrderWorker() {
        if (process.env["workerName"] !== WORKER.ORDER) {
            throw Error("checkInOrderWorker fail");
        }
    }
}
