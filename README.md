# cot-server (English)
For Chinese version please see [README-zh](README-zh.md).

## Overview
NestJS server for cot services in the Bnqkl/BFMeta ecosystem, providing REST APIs and background jobs.

## Getting Started
```bash
pnpm install
pnpm run start:dev   # watch mode
docker-compose up    # if docker config is present
```

## Contribution
- Product/service (Layer 2A, GPLv3). Keep controllers thin, move business to providers.
- Document required env vars (DB, queues, secrets) in config example.
- Add tests for new endpoints/queues; keep TS strict.
- Branches: `feature/<scope>`, `fix/<issue>`.
