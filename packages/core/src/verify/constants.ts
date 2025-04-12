/** 验签过期间隔 */
export const VERIFY_EXPIRE_TIME = 1000 * 60 * 5;

/**接口请求地址 */
export enum COT_VERIFY_API_REQUEST {
    /**获取授权码，返回授权信息 */
    GET_TOKEN = "/verify/token",
    /**获取配置信息 */
    GET_CONFIG = "/verify/getconfig",
    /**设置配置信息 */
    SET_CONFIG = "/verify/setconfig",
    /**获取已注入私钥的地址 */
    GET_INJECT_ADDRESS = "/verify/address",
    /**设置注入的私钥 */
    INJECT_SECRET = "/verify/inject",
    /**获取已注入私钥的外链地址 */
    GET_INJECT_EXTERNAL_ADDRESS = "/verify/address/external",
    /**注入外链私钥 */
    INJECT_EXTERNAL_SECRET = "/verify/inject/external",
    /**获取非对称加密的公钥 */
    GET_RAS_PUBLICKEY = "/verify/getRsaPublucKey",
}
