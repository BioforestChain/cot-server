import type { ExternalChainName} from "@bnqkl/cot-core";
import { ExternalAssetType, INTERNAL_CHAIN_RW_ACCOUNT_TYPE } from "@bnqkl/cot-core";
import type { CMD } from "../common/index.js";

export {};
declare global {
    export namespace COTServer {
        export namespace Cluster {
            export interface IPC_Request_Function {
                [CMD.INJECT_RW_SECRET]: ServerUtil.Cluster.ReqResAsync<{ accountType: string; keypairStr: string }, boolean>;
                [CMD.GET_INJECT_RW_ADDRESS]: ServerUtil.Cluster.ReqResAsync<{}, { [accountType: string]: string }>;
                [CMD.INJECT_EXTERNAL_SECRET]: ServerUtil.Cluster.ReqResAsync<
                    {
                        chainName: ExternalChainName;
                        assetType: string;
                        keypairStr: string;
                    },
                    boolean
                >;
                [CMD.GET_INJECT_EXTERNAL_ADDRESS]: ServerUtil.Cluster.ReqResAsync<{}, { [chainName: string]: { [assetType: string]: string } }>;
                [CMD.CREATE_RECHARGE_ORDER_OBJ]: ServerUtil.Cluster.ReqResAsync<{ orderId: string }, boolean>;
                [CMD.CREATE_REDEMPTION_ORDER_OBJ]: ServerUtil.Cluster.ReqResAsync<{ orderId: string }, boolean>;
            }
        }
    }
}
