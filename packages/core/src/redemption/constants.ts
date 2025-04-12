/**接口请求地址 */
export enum COT_REDEMPTION_API_REQUEST {
    /**赎回订单重试外链上链 */
    RETRY_EXTERNAL_ONCHAIN = "/redemption/retryExternalOnChain",
    /**赎回订单重试内链上链 */
    RETRY_INTERNAL_ONCHAIN = "/redemption/retryInternalOnChain",
    /**获取赎回记录列表 */
    RECORDS = "/redemption/records",
    /**获取赎回记录详情 */
    RECORD_DETAIL = "/redemption/recordDetail",
    /**赎回V2 */
    REDEMPTION_V2 = "/redemption/V2",
}

/**赎回订单状态 */
export enum REDEMPTION_ORDER_STATE_ID {
    /**初始 */
    INIT = 1,
    /**等待内链上链 */
    INTERNAL_WAIT_ON_CHAIN = 2,
    /**内链上链失败 */
    INTERNAL_ON_CHAIN_FAIL = 201,
    /**等待外链上链 */
    EXTERNAL_WAIT_ON_CHAIN = 3,
    /**外链上链失败 */
    EXTERNAL_ON_CHAIN_FAIL = 301,
    /**成功 */
    SUCCESS = 4,
}

/**赎回记录状态 */
export enum REDEMPTION_RECORD_STATE {
    /**转账中 */
    PENDING = 1,
    /**外链交易转账中 */
    TO_BE_POSTED = 2,
    /**赎回已到账 */
    POSTED = 3,
    /**赎回失败 */
    FAIL = 4,
}

/**赎回类型 */
export enum REDEMPTION_TYPE {
    /**转账赎回 */
    TRANSFER = 1,
    /**销毁赎回 */
    DESTROY = 2,
}
