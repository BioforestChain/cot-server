/**RedisRepository名字 */
export const enum REDIS_REPOSITORY_NAME {
    /**外链账户 */
    EXTERNAL_CHAIN_ACCOUNT = "externalChainAccount",
}

/**非对称密钥公钥对称加密的key */
export const RSA_PUBLIC_KEY = "payment_rsa_public_key";
/**非对称密钥私钥对称加密的key */
export const RSA_PRIVATE_KEY = "payment_rsa_private_key";

/**全局唯一id枚举 */
export const enum GLOBAL_VALUE_ENTITY_ID {
    /**充值相关 */
    RECHARGE = "recharge",
    /**价格相关 */
    PRICE = "price",
    /**账户 */
    ACCOUNT = "account",
}

/**充值相关hKey */
export const enum RECHARGE_HKEY {
    /**总充值usdt数 */
    TOTAL_RECHARGE_USDT = "totalRechargeUsdt",
}

/**提现相关hKey */
export const enum WITHDRAW_HKEY {
    /**总提现数 */
    TOTAL_WITHDRAW_PMC = "totalWithdrawPmc",
}

/**非对称密钥对相关hKey */
export const enum RSA_KEYPAIR_HKEY {
    /**公钥 */
    PUBLIC_KEY = "publicKey",
    /**私钥 */
    PRIVATE_KEY = "privateKey",
}

/**外链账户key类型 */
export const enum EXTERNAL_ACCOUNT_KEY_TYPE {
    /**充值币种累计信息 */
    DEPOSIT_COIN_ADDUP_INFO = "depositCoinAddupInfo",
    /**充值奖励未到账累计信息 */
    DEPOSIT_REWARD_TO_BE_POSTED_ADDUP_INFO = "depositRewardToBePostedAddupInfo",
    /**充值奖励已到账累计信息 */
    DEPOSIT_REWARD_POSTED_ADDUP_INFO = "depositRewardPostedAddupInfo",
}
