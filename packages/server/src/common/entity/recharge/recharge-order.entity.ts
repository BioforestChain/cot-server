import type { InternalAssetType, InternalChainName } from "@bnqkl/wallet-sdk";
import { FSMEntity } from "@bnqkl/wallet-sdk";
import type { ExternalChainName, RECHARGE_ORDER_STATE_ID, RECHARGE_TYPE } from "@bnqkl/cot-core";
import { Column, Entity } from "typeorm";

@Entity("payment_recharge_order")
export class RechargeOrder extends FSMEntity<RECHARGE_ORDER_STATE_ID> {
    /**外链发起地址 */
    @Column("varchar", { name: "wallet_address" })
    walletAddress!: string;

    /**外链名 */
    @Column("varchar", { name: "wallet_chain" })
    walletChain!: ExternalChainName;

    /**充值交易id */
    @Column("varchar", { name: "wallet_tx_id" })
    walletTxId!: string;

    /**充值金额 */
    @Column("varchar", { name: "wallet_amount" })
    walletAmount!: string;

    /**充值资产类型 */
    @Column("varchar", { name: "wallet_asset" })
    walletAsset!: string;

    /**充值资产精度 */
    @Column("smallint", { name: "wallet_decimals" })
    walletDecimals!: number;

    /**合约地址 */
    @Column({ name: "contract_address" })
    contractAddress?: string;

    /**内链名 */
    @Column("varchar", { name: "internal_chain" })
    internalChain!: InternalChainName;

    /**内链接收地址 */
    @Column("varchar", { name: "internal_address" })
    internalAddress!: string;

    /**内链recharge转账事件id */
    @Column("varchar", { name: "recharge_tx_id" })
    rechargeTxId!: string;

    /**内链recharge奖励值 */
    @Column("bigint", { name: "recharge_amount" })
    rechargeAmount!: bigint;

    /**内链recharge转账事件已上链 */
    @Column("boolean", { name: "recharge_tx_onchain" })
    rechargeTxOnChain!: boolean;

    /**内链recharge的资产名 */
    @Column("varchar", { name: "recharge_assettype" })
    rechargeAssetType!: InternalAssetType;

    /**充值类型 */
    @Column("smallint", { name: "recharge_type" })
    rechargeType!: RECHARGE_TYPE;
}
