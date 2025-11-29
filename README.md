# cot-server (English)
For Chinese version please see [README-zh](README-zh.md).

## Overview
Monorepo NestJS backend for cot services in the Bnqkl/BFMeta ecosystem. Provides REST APIs plus background processing.

## Architecture
- Workspaces `packages/`: `server` (NestJS app/controllers), `core` (domain/services/DTO/util), `test` (integration/e2e).
- Tooling: `lerna.json`, `pnpm-workspace.yaml`, `tsconfig.build.json`; scripts in `scripts/`.
- Config: see `config/` or env templates for DB/queue/secret settings.

## Getting Started
```bash
pnpm install
pnpm run start:dev   # dev watch
pnpm run start:prod  # production
pnpm run test        # unit/e2e if configured
```
If docker-compose is provided, you can `docker-compose up` for local stack.

## Contribution Guide
- Layer 2A (GPLv3). Keep controllers thin; put domain logic in `core` providers/services (SRP/DRY).
- Document required env vars (DB, queues, secrets) near configs; keep sample .env up to date.
- Add tests in `packages/test` (or package-local) for new endpoints/queues; enforce TS strict, avoid `any`.
- Branches: `feature/<scope>` / `fix/<issue>`; concise commits.
