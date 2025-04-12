/**
 * 错误码
 *
 * 100 通用错误
 * 101 授权模块
 * 102 邀请模块
 * 103 充值模块
 * 104 提现模块
 */

export const ErrorCode = {
    /*********100 通用错误 start**********/

    /**系统繁忙 */
    SYSTEM_BUSY: { code: 10000, message: "system is too busy, please try again later" },

    /*********100 通用错误 end**********/

    /*********101 授权模块 start**********/

    /**无效授权 */
    INVALID_AUTH: { code: 10100, message: "invalid authorization, please Reauthorization" },
    /**授权信息异常-无效地址 */
    AUTH_INFO_EXCEPTION_INVALID_ADDRESS: {
        code: 10101,
        message: "auth info error, invalid address",
    },
    /**授权信息异常-未知区块链 */
    AUTH_INFO_EXCEPTION_UNKNOW_CHAIN: { code: 10102, message: "auth info error, unknow chain" },
    /**授权信息异常-无效签名 */
    AUTH_INFO_EXCEPTION_INVALID_SIGN: {
        code: 10103,
        message: "auth info error, invalid signature",
    },
    /**设备或地址正在被其他人使用 */
    DEVICE_OR_ADDRESS_BE_USE: {
        code: 10104,
        message: "device or address is being used by someone other",
    },

    /*********101 授权模块 end**********/

    /*********102 邀请模块 start**********/

    /**邀请码错误 */
    INVITE_CODE_ERROR: { code: 10200, message: "invite code is error" },
    /**无法授权 */
    CAN_NOT_AUTH: { code: 10201, message: "can not auth" },
    /**邀请码已经绑定上级 */
    INVITE_CODE_ALREADY_BINDED: {
        code: 10202,
        message: "invite code already binded superior code",
    },
    /**地址未授权 */
    ADDRESS_NOT_AUTH: { code: 10203, message: "address is not auth" },
    /**不允许邀请自己 */
    CAN_NOT_INVITE_YOURSELF: { code: 10204, message: "can not invite yourself" },

    /*********102 邀请模块 end**********/

    /*********103 充值模块 start**********/

    /**充值异常-创建和广播交易错误 */
    RECHARGE_CREATE_AND_BROADCAST_ERROR: {
        code: 10300,
        message: "wallet recharge exception, create and broadcast transaction error",
    },
    /**充值异常-交易签名丢失 */
    RECHARGE_TRAN_SIGN_MISSING: {
        code: 10301,
        message: "wallet recharge exception, transaction sign is missing",
    },
    /**充值异常-不支持的链 */
    RECHARGE_NOT_SUPPORT_CHAIN: {
        code: 10302,
        message: "wallet recharge exception, not support chain",
    },
    /**获取PMC链区块异常 */
    GET_PMC_CHAIN_BLOCK_ERROR: { code: 10303, message: "get pmc chain block error" },

    /*********103 充值模块 end**********/

    /*********104 提现模块 start**********/

    /**提现次数不足 */
    WITHDRAW_TIMES_BE_NOT_ENOUGH: { code: 10400, message: "withdraw times be not enough" },
    /**提现额度不足 */
    WITHDRAW_LIMIT_BE_NOT_ENOUGH: { code: 10401, message: "withdraw limit be not enough" },
    /**每次提现范围错误 */
    EACH_WITHDRAW_RANGE_ERROR: { code: 10402, message: "each withdraw range error" },
    /**提现关闭 */
    WITHDRAW_CLOSE_ERROR: { code: 10403, message: "withdraw is closed" },

    /*********104 提现模块 end**********/

    /*********105 **********/

    /**管理员模块 */
    /**无效授权 */
    ADMIN_INVALID_AUTH: { code: 900000, message: "invalid authorization, please Reauthorization" },
    /**登录账号错误 */
    ADMIN_LOGIN_NAME_ERROR: { code: 900001, message: "login name is error" },
    /**密码错误 */
    ADMIN_PASSWORD_ERROR: { code: 900002, message: "password is error" },
    /**密码错误 */
    ADMIN_OLD_PASSWORD_ERROR: { code: 900002, message: "old password is error" },
    /**只有超管才可以添加用户 */
    ONLY_SUPER_ADMIN_ADD_USER: { code: 900002, message: "only super admin can add user" },
};
