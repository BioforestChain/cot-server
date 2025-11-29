# cot-server（中文）
英文版请参见 [README](README.md)。

## 简介
Bnqkl/BFMeta 生态的 cot 服务后端（NestJS），提供 REST 接口与后台任务。

## 快速开始
```bash
pnpm install
pnpm run start:dev   # 开发监听
docker-compose up    # 若提供 docker 配置
```

## 贡献
- 产品/服务（Layer 2A，GPLv3）。控制器保持薄，业务放 provider。
- 在配置示例中注明必需的环境变量（数据库、队列、密钥）。
- 新增接口/队列需补测试，保持 TS 严格。
- 分支：`feature/<scope>`、`fix/<issue>`。
