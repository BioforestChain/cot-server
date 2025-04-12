/** 每日缓存TTL 秒级 24小时 */
export const PAYMENT_EVERYDAY_LIMIT_TTL = 86400;

/**充值开发环境测试key */
export const RECHARGE_DEV_TEST_KEY = "rechargeDevTest";

/**赎回开发环境测试key */
export const REDEMPTION_DEV_TEST_KEY = "redemptionDevTest";

/**订单类型 */
export enum ORDER_TYPE {
    /**充值订单 */
    RECHARGE = "recharge",
    /**赎回订单 */
    REDEMPTION = "redemption",
}

/**获得奖励的来源邀请码个数限制 */
export const REWARD_INVITE_CODE_NUM_LIMIT = 2;

/**
 * 交易关联业务类型
 */
export enum TRANSACTION_LINK_TYPE {
    /**无关联 */
    NONE = 0,
    /**与充值订单关联 */
    RECHARGE_ORDER = 1,
    /**与赎回订单关联 */
    REDEMPTION_ORDER = 3,
}
