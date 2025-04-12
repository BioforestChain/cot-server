/**用户状态 */
export enum USER_STATUS {
    /**停用 */
    STOP = 0,
    /**启用 */
    START = 1,
}
export enum FIX_RECHARGE_ORDER_TYPE {
    /**充值订单重试外链上链 */
    RETRY_EXTERNAL_ON_CHAIN = 1,
    /**充值订单重试内链上链 */
    RETRY_INTERNAL_ON_CHAIN,
}
export enum FIX_REDEMPTION_ORDER_TYPE {
    /**赎回订单重试内链上链 */
    RETRY_INTERNAL_ON_CHAIN = 1,
    /**赎回订单重试外链上链 */
    RETRY_EXTERNAL_ON_CHAIN,
}

let inc = 1;
export enum USER_ROLE {
    ANYONE = 0,
    /**超级管理员 1 */
    SUPER_ADMIN = 1,
    /**普通管理员 2 */
    ADMIN = 1 << inc++,
}
