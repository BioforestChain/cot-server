/**接口请求地址 */
export enum COT_RECHARGE_API_REQUEST {
    /**充值订单重试外链上链 */
    RETRY_EXTERNAL_ONCHAIN = "/recharge/retryExternalOnChain",
    /**充值订单重试内链上链 */
    RETRY_INTERNAL_ONCHAIN = "/recharge/retryInternalOnChain",
    /**获取充值统计信息 */
    STAT_INFO = "/recharge/statInfo",
    /**获取充值记录列表 */
    RECORDS = "/recharge/records",
    /**获取充值记录详情 */
    RECORD_DETAIL = "/recharge/recordDetail",
    /**获取当前充值允许的代币 */
    SUPPORT = "/recharge/support",
    /**获取合约池信息 */
    CONTRACT_POOL_INFO = "/recharge/contractPoolInfo",
    /**充值V2 */
    RECHARGE_V2 = "/recharge/V2",
}

/**充值订单状态 */
export enum RECHARGE_ORDER_STATE_ID {
    /**初始 */
    INIT = 1,
    /**等待外链上链 */
    EXTERNAL_WAIT_ON_CHAIN = 2,
    /**外链上链失败 */
    EXTERNAL_ON_CHAIN_FAIL = 201,
    /**等待内链上链 */
    INTERNAL_WAIT_ON_CHAIN = 3,
    /**内链上链失败 */
    INTERNAL_ON_CHAIN_FAIL = 301,
    /**成功 */
    SUCCESS = 4,
}

/**充值记录状态 */
export enum RECHARGE_RECORD_STATE {
    /**充值中 */
    PENDING = 1,
    /**奖励发放中 */
    TO_BE_POSTED = 2,
    /**奖励已发放 */
    POSTED = 3,
    /**充值失败 */
    FAIL = 4,
}

/**充值类型 */
export enum RECHARGE_TYPE {
    /**发行充值 */
    ISSUE = 2,
    /**空投 */
    AIRDROP = 3,
}
