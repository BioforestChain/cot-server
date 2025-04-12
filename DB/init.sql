-- 充值相关
CREATE TABLE IF NOT EXISTS `payment_recharge_order` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `entity_id` varchar(50) NOT NULL DEFAULT '' COMMENT '唯一id',
    `state` smallint unsigned NOT NULL DEFAULT '0' COMMENT '订单状态(1:初始 2:等待外链上链 201:外链上链失败 3:等待内链上链 301:内链上链失败 4:成功)',
    `wallet_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链发起地址',
    `wallet_chain` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链名',
    `wallet_tx_id` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链交易id',
    `wallet_amount` varchar(50) NOT NULL DEFAULT '' COMMENT '充值金额',
    `wallet_asset` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '充值资产类型',
    `wallet_decimals` smallint unsigned NOT NULL DEFAULT '0' COMMENT '充值资产精度',
    `contract_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '合约地址',
    `internal_chain` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链名',
    `internal_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链接收地址',
    `recharge_tx_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链recharge转账事件id',
    `recharge_amount` bigint unsigned NOT NULL DEFAULT '0' COMMENT '内链recharge奖励值',
    `recharge_tx_onchain` tinyint(1) NOT NULL DEFAULT '0' COMMENT '内链recharge转账事件已上链',
    `recharge_assettype` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链recharge的资产名',
    `recharge_type` tinyint(1) DEFAULT '1' COMMENT '充值类型',
    `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `del_flag` tinyint NOT NULL DEFAULT '0' COMMENT '逻辑删除标志：0：正常，1：删除，默认0',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_entityId` (`entity_id`),
    UNIQUE KEY `uniq_rechargeTxId` (`recharge_tx_id`) USING BTREE,
    UNIQUE KEY `uniq_walletTxId` (`wallet_tx_id`) USING BTREE,
    KEY `idx_wallet_chain_address` (`wallet_chain`,`wallet_address`),
    KEY `idx_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='支付链充值订单表';

-- 赎回相关
CREATE TABLE IF NOT EXISTS `payment_redemption_order` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `entity_id` varchar(50) NOT NULL DEFAULT '' COMMENT '唯一id',
    `state` smallint unsigned NOT NULL DEFAULT '0' COMMENT '订单状态(1:初始 2:等待内链上链 201:内链上链失败 3:等待外链上链 301:外链上链失败 4:成功)',
    `redemption_type` tinyint(1) DEFAULT '1' COMMENT '赎回类型',
    `internal_chain` varchar(10) NOT NULL COMMENT '内链名',
    `internal_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链发起地址',
    `redemption_tx_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链redemption转账事件id',
    `redemption_amount` bigint unsigned NOT NULL DEFAULT '0' COMMENT '赎回redemption数量',
    `redemption_assettype` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '内链redemption的资产名',
    `redemption_ratio` float(10,7) unsigned NOT NULL DEFAULT '0.000' COMMENT '赎回比例',
    `redemption_fee` bigint unsigned NOT NULL DEFAULT '0' COMMENT '赎回手续费',
    `wallet_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链接收地址',
    `wallet_chain` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链名',
    `wallet_tx_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '外链交易id',
    `contract_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '合约地址',
    `wallet_amount` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '赎回资产数量',
    `wallet_asset` varchar(20) NOT NULL DEFAULT '' COMMENT '赎回资产类型',
    `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `del_flag` tinyint NOT NULL DEFAULT '0' COMMENT '逻辑删除标志：0：正常，1：删除，默认0',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_entityId` (`entity_id`),
    UNIQUE KEY `uniq_rechargeTxId` (`redemption_tx_id`) USING BTREE,
    UNIQUE KEY `uniq_walletTxId` (`wallet_tx_id`) USING BTREE,
    KEY `idx_wallet_chain_address` (`wallet_chain`,`wallet_address`),
    KEY `idx_state` (`state`),
    KEY `idx_internalAddress` (`internal_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='支付链赎回订单表';

CREATE TABLE IF NOT EXISTS `user` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `login_name` varchar(64) NOT NULL COMMENT '登录账号',
    `password` varchar(200) NOT NULL COMMENT '密码',
    `nick_name` varchar(64) DEFAULT NULL COMMENT '昵称',
    `mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
    `email` varchar(64) DEFAULT NULL COMMENT '电子邮箱',
    `login_time` datetime DEFAULT NULL COMMENT '登录时间',
    `status` int(1) NOT NULL DEFAULT '1' COMMENT '状态(0:停用,1:启用)',
    `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `index_login_name` (`login_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';


CREATE TABLE IF NOT EXISTS `operate_record` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `login_name` varchar(64) NOT NULL COMMENT '操作账号',
    `api` varchar(200) NOT NULL COMMENT '操作接口',
    `version` varchar(200) DEFAULT NULL COMMENT '版本号',
    `data` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '操作数据',
    `result` tinyint(1) NOT NULL COMMENT '操作结果',
    `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `login_name_index` (`login_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';

ALTER TABLE `user` 
ADD COLUMN `role` int(20) NOT NULL COMMENT '权限' AFTER `status`;