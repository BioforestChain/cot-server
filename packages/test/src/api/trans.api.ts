import {
    ChainHelper,
    InternalChainName,
    NetWorkHelper,
    WALLET_BCF_API_REQUEST,
    WALLET_BSC_API_REQUEST,
    WALLET_ETH_API_REQUEST,
    WALLET_TRON_API_REQUEST,
} from "@cot/server";

export class TransApi {
    /**
     * 获取最新区块高度
     * @param chainName
     * @param networkHelper
     * @returns
     */
    static async getLastblockHeight(chainName: InternalChainName, networkHelper: NetWorkHelper) {
        const apiPath = ChainHelper.getBcfPath(chainName, WALLET_BCF_API_REQUEST.GET_LAST_BLOCK_HEIGHT);
        const result = await networkHelper.get<{}, number>(apiPath, {});
        return result;
    }

    /**
     * 创建转账事件
     * @param chainName
     * @param request
     * @param networkHelper
     * @returns
     */
    static async createTransferAsset(chainName: InternalChainName, request: WalletTypings.Bcf.Api.BcfCreateTransferAssetReqDto, networkHelper: NetWorkHelper) {
        const apiPath = ChainHelper.getBcfPath(chainName, WALLET_BCF_API_REQUEST.CREATE_TRANSFER_ASSET);
        const result = await networkHelper.post<WalletTypings.Bcf.Api.BcfCreateTransferAssetReqDto, WalletTypings.Bcf.Api.BcfCreateTransferAssetResDto>(
            apiPath,
            request,
        );
        return result;
    }

    /**
     * 广播转账事件
     * @param chainName
     * @param request
     * @param networkHelper
     * @returns
     */
    static async broadcastTransferAsset(
        chainName: InternalChainName,
        request: WalletTypings.Bcf.Api.BcfBroadcastTransferAssetReqDto,
        networkHelper: NetWorkHelper,
    ) {
        const apiPath = ChainHelper.getBcfPath(chainName, WALLET_BCF_API_REQUEST.BROADCAST_TRANSFER_ASSET);
        const result = await networkHelper.post<WalletTypings.Bcf.Api.BcfBroadcastTransferAssetReqDto, WalletTypings.Bcf.Api.BcfBroadcastTransferAssetResDto>(
            apiPath,
            request,
        );
        return result;
    }

    /**
     * 广播交易
     * @param chainName
     * @param request
     * @param networkHelper
     * @returns
     */
    static async broadcastTransaction(
        chainName: InternalChainName,
        request: WalletTypings.Bcf.Api.BcfBroadcastTransactionReqDto,
        networkHelper: NetWorkHelper,
    ) {
        const apiPath = ChainHelper.getBcfPath(chainName, WALLET_BCF_API_REQUEST.BROADCAST_TRANSACTION);
        const result = await networkHelper.post<WalletTypings.Bcf.Api.BcfBroadcastTransactionReqDto, WalletTypings.Bcf.Api.BcfBroadcastTransactionResDto>(
            apiPath,
            request,
        );
        return result;
    }

    /**
     * bsc-获取chainId
     * @param networkHelper
     * @returns
     */
    static async getBscChainId(networkHelper: NetWorkHelper) {
        const result = await networkHelper.get<{}, WalletTypings.Bsc.Api.BscGetChainIdResDto>(WALLET_BSC_API_REQUEST.GET_CHAIN_ID, {});
        return result;
    }

    /**
     * bsc-交易前需要的预备信息
     * @param request
     * @param networkHelper
     * @returns
     */
    static async getBscTransPrep(request: WalletTypings.Bsc.Api.BscTransPrepReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Bsc.Api.BscTransPrepReqDto, WalletTypings.Bsc.Api.BscTransPrepResDto>(
            WALLET_BSC_API_REQUEST.TRANS_PREP,
            request,
        );
        return result;
    }

    /**
     * bsc-合约交易的data
     * @param request
     * @param networkHelper
     * @returns
     */
    static async getBscContractTransData(request: WalletTypings.Bsc.Api.Bep20TransDataReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Bsc.Api.Bep20TransDataReqDto, string>(WALLET_BSC_API_REQUEST.GET_CONTRACT_DATA, request);
        return result;
    }

    /**
     * bsc-对交易数据进行签名
     * @param request
     * @param networkHelper
     * @returns
     */
    static async signBscTransaction(request: BFChainWallet.ETH.SignTransactionReq, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<BFChainWallet.ETH.SignTransactionReq, BFChainWallet.ETH.SignTransactionRes>(
            WALLET_BSC_API_REQUEST.TRANS_SIGN,
            request,
        );
        return result;
    }

    /**
     * bsc-合约交易测试
     * @param request
     * @param networkHelper
     * @returns
     */
    static async createBscBep20Trans(request: WalletTypings.Bsc.Api.BscCreateTransReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Bsc.Api.BscCreateTransReqDto, string>(WALLET_BSC_API_REQUEST.TRANS_BEP20_CREATE, request);
        return result;
    }

    /**
     * bsc-直接广播
     * @param request
     * @param networkHelper
     * @returns
     */
    static async bscBroadcastDirect(request: WalletTypings.Bsc.Api.BscBrocastDirectReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Bsc.Api.BscBrocastDirectReqDto, WalletTypings.Bsc.Api.BscBrocastDirectResDto>(
            WALLET_BSC_API_REQUEST.BROADCAST_DIRECT,
            request,
        );
        return result;
    }

    /**
     * eth-获取chainId
     * @param networkHelper
     * @returns
     */
    static async getEthChainId(networkHelper: NetWorkHelper) {
        const result = await networkHelper.get<{}, WalletTypings.Eth.Api.EthGetChainIdResDto>(WALLET_ETH_API_REQUEST.GET_CHAIN_ID, {});
        return result;
    }

    /**
     * eth-交易前需要的预备信息
     * @param request
     * @param networkHelper
     * @returns
     */
    static async getEthTransPrep(request: WalletTypings.Eth.Api.EthTransPrepReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Eth.Api.EthTransPrepReqDto, WalletTypings.Eth.Api.EthTransPrepResDto>(
            WALLET_ETH_API_REQUEST.TRANS_PREP,
            request,
        );
        return result;
    }

    /**
     * eth-合约交易的data
     * @param request
     * @param networkHelper
     * @returns
     */
    static async getEthContractTransData(request: WalletTypings.Eth.Api.Erc20TransDataReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Eth.Api.Erc20TransDataReqDto, WalletTypings.Eth.Api.Erc20TransDataResDto>(
            WALLET_ETH_API_REQUEST.GET_CONTRACT_DATA,
            request,
        );
        return result;
    }

    /**
     * eth-对交易数据进行签名
     * @param request
     * @param networkHelper
     * @returns
     */
    static async signEthTransaction(request: WalletTypings.Eth.Api.EthSignTransactionReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Eth.Api.EthSignTransactionReqDto, WalletTypings.Eth.Api.EthSignTransactionResDto>(
            WALLET_ETH_API_REQUEST.TRANS_SIGN,
            request,
        );
        return result;
    }

    /**
     * eth-直接广播
     * @param request
     * @param networkHelper
     * @returns
     */
    static async ethBroadcastDirect(request: WalletTypings.Eth.Api.EthBrocastDirectReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Eth.Api.EthBrocastDirectReqDto, WalletTypings.Eth.Api.EthBrocastDirectResDto>(
            WALLET_ETH_API_REQUEST.BROADCAST_DIRECT,
            request,
        );
        return result;
    }

    /**
     * tron-创建TRX普通交易V2
     * @param request
     * @param newtworkHelper
     * @returns
     */
    static async createTronNormalTrans(request: WalletTypings.Tron.Api.TronCreateNormalTransV2ReqDto, newtworkHelper: NetWorkHelper) {
        const result = await newtworkHelper.post<WalletTypings.Tron.Api.TronCreateNormalTransV2ReqDto, WalletTypings.Tron.Api.TronCreateNormalTransV2ResDto>(
            WALLET_TRON_API_REQUEST.CREATE_NORMAL_TRANS_V2,
            request,
        );
        return result;
    }

    /**
     * tron-创建TRC20交易V2
     * @param request
     * @param newtworkHelper
     * @returns
     */
    static async createTronContractTrans(request: WalletTypings.Tron.Api.TronCreateContractTransV2ReqDto, newtworkHelper: NetWorkHelper) {
        const result = await newtworkHelper.post<
            WalletTypings.Tron.Api.TronCreateContractTransV2ReqDto,
            WalletTypings.Tron.Api.TronCreateContractTransV2ResDto
        >(WALLET_TRON_API_REQUEST.CREATE_CONTRACT_TRANS_V2, request);
        return result;
    }

    /**
     * tron-直接广播
     * @param request
     * @param networkHelper
     * @returns
     */
    static async tronBroadcastDirect(request: WalletTypings.Tron.Api.TronBrocastDirectReqDto, networkHelper: NetWorkHelper) {
        const result = await networkHelper.post<WalletTypings.Tron.Api.TronBrocastDirectReqDto, WalletTypings.Tron.Api.TronBrocastDirectResDto>(
            WALLET_TRON_API_REQUEST.BROADCAST_DIRECT,
            request,
        );
        return result;
    }
}
