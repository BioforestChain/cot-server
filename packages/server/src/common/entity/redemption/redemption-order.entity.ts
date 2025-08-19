import type { InternalAssetType, InternalChainName } from "@bnqkl/wallet-sdk";
import { FSMEntity } from "@bnqkl/wallet-sdk";
import type { ExternalAssetType, ExternalChainName, REDEMPTION_ORDER_STATE_ID, REDEMPTION_TYPE } from "@bnqkl/cot-core";
import { Column, Entity } from "typeorm";

@Entity("payment_redemption_order")
export class RedemptionOrder extends FSMEntity<REDEMPTION_ORDER_STATE_ID> {
    /**内链名 */
    @Column("varchar", { name: "internal_chain" })
    internalChain!: InternalChainName;

    /**内链发起地址 */
    @Column("varchar", { name: "internal_address" })
    internalAddress!: string;

    /**内链redemption转账事件id */
    @Column("varchar", { name: "redemption_tx_id" })
    redemptionTxId!: string;

    /**赎回redemption数量 */
    @Column("bigint", { name: "redemption_amount" })
    redemptionAmount!: bigint;

    /**内链recharge的资产名 */
    @Column("varchar", { name: "redemption_assettype" })
    redemptionAssetType!: InternalAssetType;

    /**赎回比例 */
    @Column("float", { name: "redemption_ratio" })
    redemptionRatio!: number;

    /**赎回手续费 */
    @Column("bigint", { name: "redemption_fee" })
    redemptionFee!: bigint;

    /**外链接收地址 */
    @Column("varchar", { name: "wallet_address" })
    walletAddress!: string;

    /**外链名 */
    @Column("varchar", { name: "wallet_chain" })
    walletChain!: ExternalChainName;

    /**外链交易id */
    @Column("varchar", { name: "wallet_tx_id" })
    walletTxId!: string;

    /**合约地址 */
    @Column("varchar", { name: "contract_address" })
    contractAddress?: string;

    /**赎回资产数量 */
    @Column("varchar", { name: "wallet_amount" })
    walletAmount!: string;

    /**赎回资产类型 */
    @Column("varchar", { name: "wallet_asset" })
    walletAsset!: ExternalAssetType;

    /**赎回类型 */
    @Column("smallint", { name: "redemption_type" })
    redemptionType!: REDEMPTION_TYPE;
}
