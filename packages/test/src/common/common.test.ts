import { $asyncAllNoNullMap, GLOBAL_PREFIX, NetWorkHelper, WALLET_GLOBAL_PREFIX, bfmetaSignUtil, staticConfig } from "@bnqkl/cot-server";
import { CommonApi } from "../api/common.api.js";
import { SECRETS } from "../constant.js";
import { BaseHelper } from "../helper/index.js";

export abstract class CommonTest {
    /**已登录用户集合 */
    private __loginAccountArray: COTServerTest.Account[] = [];
    defaultNetwork = new NetWorkHelper(staticConfig.test.serverIp ?? "localhost", staticConfig.test.port ?? staticConfig.ports.web, GLOBAL_PREFIX);
    defaultwalletNetwork = new NetWorkHelper(staticConfig.wallet.ip, staticConfig.wallet.port, WALLET_GLOBAL_PREFIX);
    /**
     * 获取已登录的账号，每次调用返回的账号不重复
     * @param num
     * @returns
     */
    async getLoginAccounts(num = 1) {
        const loginSecrets = SECRETS.slice(this.__loginAccountArray.length, this.__loginAccountArray.length + num);
        return await $asyncAllNoNullMap(loginSecrets, async ({ secret }) => {
            const info = await this.createAccountBySecret(secret);
            const serverNetwork = new NetWorkHelper(staticConfig.test.serverIp ?? "localhost", staticConfig.test.port ?? staticConfig.ports.web, GLOBAL_PREFIX);
            const walletNetwork = new NetWorkHelper(staticConfig.wallet.ip, staticConfig.wallet.port, WALLET_GLOBAL_PREFIX);
            const inviteCode = await CommonApi.login(info, serverNetwork);
            console.info(`login :${info.address} inviteCode:${inviteCode}`);
            const account: COTServerTest.Account = { info, inviteCode, serverNetwork, walletNetwork };
            this.__loginAccountArray.push(account);
            return account;
        });
    }

    async createAccountBySecret(secret: string): Promise<COTServerTest.Account["info"]> {
        const keypair = await bfmetaSignUtil.createKeypair(secret);
        const address = await bfmetaSignUtil.getAddressFromPublicKey(keypair.publicKey);
        return {
            deviceId: secret,
            secret,
            secret2: BaseHelper.stringTOMnemonic(secret),
            address,
            keypair,
        };
    }
}
