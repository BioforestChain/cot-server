/**全局前缀 */
export const GLOBAL_PREFIX = "cot";

/**内链上对应的usdt锚定权益 暂时不用 */
export enum INTERNAL_CHAIN_USDT_TOKEN {
    ETH_USDT = "ETH-USDT",
    BSC_USDT = "BSC-USDT",
    TRON_USDT = "TRON-USDT",
}

/**内链的充值提现账户类型 */
export enum INTERNAL_CHAIN_RW_ACCOUNT_TYPE {
    /**充值V2账户 */
    RECHARGEV2_ACCOUNT = "RECHARGEV2_ACCOUNT",
    /**AIRDROP */
    AIRDROP_ACCOUNT = "AIRDROP_ACCOUNT",
}
