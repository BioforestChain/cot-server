export const VERSION = process.env["VERSION"] as string;
export const PROJECT_NAME = "METABOX";

/**进程名 */
export const WORKER = {
    /**WEB服务进程 */
    WEB: "web",
    /**业务处理进程 */
    BUSINESS: "business",
    /**主进程 */
    MASTER: "master",
    /**全局进程，集群唯一 */
    GLOBAL: "global",
    /**订单处理进程 */
    ORDER: "order",
    /**所有进程 */
    ALL: "*",
};

export const enum CMD {
    /**注入充值提现私钥 */
    INJECT_RW_SECRET = "INJECT_RW_SECRET",
    /**获取注入充值提现地址 */
    GET_INJECT_RW_ADDRESS = "GET_INJECT_RW_ADDRESS",
    /**注入外链私钥 */
    INJECT_EXTERNAL_SECRET = "INJECT_EXTERNAL_SECRET",
    /**获取注入的外链地址 */
    GET_INJECT_EXTERNAL_ADDRESS = "GET_INJECT_EXTERNAL_ADDRESS",
    /**生成充值订单逻辑对象 */
    CREATE_RECHARGE_ORDER_OBJ = "CREATE_RECHARGE_ORDER_OBJ",
    /**生成赎回订单逻辑对象 */
    CREATE_REDEMPTION_ORDER_OBJ = "CREATE_REDEMPTION_ORDER_OBJ",
}
