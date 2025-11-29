# cot-server（中文）
英文版请参见 [README](README.md)。

## 简介
Bnqkl/BFMeta 生态的 cot 服务后端 monorepo（NestJS），提供 REST 接口与后台处理。

## 架构
- 工作区 `packages/`：`server`（Nest 应用/控制器）、`core`（领域服务/DTO/工具）、`test`（集成/端到端）。
- 工具链：`lerna.json`、`pnpm-workspace.yaml`、`tsconfig.build.json`；脚本位于 `scripts/`。
- 配置：参考 `config/` 或 env 模板（数据库、队列、密钥等）。

## 快速开始
```bash
pnpm install
pnpm run start:dev   # 开发
pnpm run start:prod  # 生产
pnpm run test        # 单测/端到端（如已配置）
```
如提供 docker-compose，可用 `docker-compose up` 启动本地栈。

## 贡献
- 生态服务（Layer 2A，GPLv3）：控制器保持薄，领域逻辑放 `core`（SRP/DRY）。
- 在配置附近注明必填 env（数据库、队列、密钥），保持示例 .env 更新。
- 新增接口/队列需补测试；TypeScript 严格，避免 `any`。
- 分支：`feature/<scope>`、`fix/<issue>`；提交简洁。
