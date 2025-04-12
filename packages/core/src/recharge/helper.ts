export const encodeTimestampMessage = (argv: { timestamp: number }) => {
    return JSON.stringify({ timestamp: argv.timestamp });
};

export const encodeRechargeV2ToTrInfoData = (argv: COTCore.Recharge.RechargeV2ToTrInfoData) => {
    return JSON.stringify({
        /**内链名 */
        chainName: argv.chainName,
        /**内链地址 */
        address: argv.address,
        /**时间戳 */
        timestamp: argv.timestamp,
    });
};
