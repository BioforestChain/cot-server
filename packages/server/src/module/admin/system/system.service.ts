import { Logger } from "@bnqkl/wallet-sdk";
import { Injectable } from "@nestjs/common";
import * as v8 from "v8";
import * as fs from "fs";
import * as path from "path";
const snapshotPath = path.resolve(process.cwd(), "./snapshots");

@Injectable()
export class SystemService {
    private __writingSnapshot = false;
    constructor() {}

    /**
     * 调用v8的写快照接口
     */
    writeHeapSnapshop() {
        if (this.__writingSnapshot) {
            return;
        }
        this.__writingSnapshot = true;
        let retryTimes = 0;
        while (retryTimes < 3) {
            try {
                Logger.debug(`try to print mem`);
                if (!fs.existsSync(snapshotPath)) {
                    fs.mkdirSync(snapshotPath, { recursive: true });
                }
                const filePath = path.resolve(snapshotPath, `./${process.env["workerName"]}-${process.pid}-${Date.now()}.heapsnapshot`);
                v8.writeHeapSnapshot(filePath);
                Logger.debug(`write memory snapshot: ${filePath}`);
                this.__writingSnapshot = false;
                return filePath;
            } catch (e) {
                Logger.error(e);
                retryTimes++;
            }
        }
    }
}
