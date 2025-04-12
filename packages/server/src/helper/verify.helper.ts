import { ErrorCode, CHAIN_ID, ExternalChainName, VERIFY_EXPIRE_TIME } from "@cot/core";
import { compareTwoStrLowerCase, $noNullMap, Logger, ResponseError } from "@bnqkl/wallet-sdk";
import { internalChainHelper, externalChainHelper, bfmetaSignUtil } from "./wallet-server-sdk";

export class VerifyHelper {
    /**获取token的key */
    static getKey(token: string) {
        return `login:${token}`;
    }

    /**获取admin token的key */
    static getAdminKey(token: string) {
        return `admin-login:${token}`;
    }

    /**
     * 获取getToken的分布式锁的key
     * @param value
     * @returns
     */
    static getTokenLockKey(value: string) {
        return `tokenLock:${value}`;
    }

    /**
     * 获取getToken的分布式锁的所有key
     * @param deviceId 设备ID
     * @param authInfos 授权信息
     * @returns
     */
    static getAllTokenLockKey(deviceId: string, authInfos: COTCore.Verify.AuthInfo[]) {
        // 用set去重
        const keys = new Set([this.getTokenLockKey(deviceId)].concat(authInfos.map((v) => this.getTokenLockKey(v.address))));
        // 按字母序排序，防止死锁
        return Array.from(keys).sort((a, b) => a.localeCompare(b));
    }

    /**
     * 验证钱包地址在授权信息中
     * @param walletAddress
     * @param walletChain
     * @param authInfos
     */
    static verifyWalletAddressInAuthInfos(walletAddress: string, walletChain: ExternalChainName, authInfos: COTCore.Verify.AuthInfo[]) {
        if (
            !authInfos.some(({ chainId, address }) => {
                return (walletChain as string as CHAIN_ID) === chainId && compareTwoStrLowerCase(walletAddress, address);
            })
        ) {
            throw new Error(`verifyWalletAddressInAuthInfos fail. walletAddress:${walletAddress} walletChain:${walletChain} is not in authInfos`);
        }
    }

    /**
     * 验证内链地址在授权信息中
     * @param internalAddress
     * @param authInfos
     */
    static verifyInternalAddressInAuthInfos(internalAddress: string, authInfos: COTCore.Verify.AuthInfo[]) {
        if (
            !authInfos.some(({ chainId, address }) => {
                return CHAIN_ID.BIOFOREST_CHAIN === chainId && internalAddress === address;
            })
        ) {
            throw new Error(`verifyInternalAddressInAuthInfos fail. internalAddress:${internalAddress} chain:${CHAIN_ID.BIOFOREST_CHAIN} is not in authInfos`);
        }
    }

    /**
     * 获取我所有的内链地址
     * @param authorization
     */
    static getAllMyInternalAddresses(authorization: COTServer.CurrentAuthInfo) {
        return $noNullMap(authorization.authInfos, ({ chainId, address }) => {
            if (chainId === CHAIN_ID.BIOFOREST_CHAIN) {
                return address;
            }
        });
    }

    /**
     * 获取我所有的地址
     * @param authorization
     */
    static getAllMyAddresses(authorization: COTServer.CurrentAuthInfo) {
        return authorization.authInfos.map((v) => v.address);
    }

    /**
     * 验签
     * @param signatureInfo 这个是前端必传的
     * @param data 这个data由前后端共同协商需要对什么数据进行签名。例如赎回 不能只单独签地址，否则会产生一样的签名。可以签地址+时间戳使其签名结果每次都不同
     * 如果使用时间戳也可以加入过期时间 比如与客户端协商好了 使用 {address, timestamp: Date.now()} 来签名，那么这个数据发往服务端验证签名正确后，还可以验证timestamp
     * 如果超过服务端有效时间5分钟(假设)则也是失败。
     * @param address 这个地址由服务端验证。 矿池了什么地址，就需要传什么地址
     */
    static async verifySignature(signatureInfo: COTCore.Verify.SignatureInfo, data: string, address: string) {
        const { signature, publicKey, timestamp } = signatureInfo;
        const resp = await bfmetaSignUtil.detachedVeriy(Buffer.from(data), Buffer.from(signature, "hex"), Buffer.from(publicKey, "hex"));
        const pkAddress = await bfmetaSignUtil.getAddressFromPublicKeyString(publicKey);
        if (pkAddress !== address) {
            throw Error(`op address fail`);
        }
        if (resp === false) {
            throw Error(`data verify fail`);
        }
        if (!(Date.now() - timestamp < VERIFY_EXPIRE_TIME)) {
            throw Error(`req timestamp expired`);
        }
        return true;
    }

    /**
     * 验证授权信息的合法性
     * @param deviceId
     * @param authInfos
     */
    static async verifyExternalAddress(chainName: ExternalChainName, address: string) {
        switch (chainName) {
            case ExternalChainName.ETH:
            case ExternalChainName.BSC: {
                if (!externalChainHelper.isEthAddress(address)) {
                    Logger.error(`invaild eth address ${address}`);
                    throw new ResponseError(ErrorCode.AUTH_INFO_EXCEPTION_INVALID_ADDRESS);
                }
                break;
            }
            case ExternalChainName.TRON: {
                if (!externalChainHelper.isTronAddress(address)) {
                    Logger.error(`invaild tron address ${address}`);
                    throw new ResponseError(ErrorCode.AUTH_INFO_EXCEPTION_INVALID_ADDRESS);
                }
                break;
            }
            default:
                throw Error(`invaild chainName: ${chainName}`);
        }
    }
}
