# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn start          # Start dev server with ts-node-dev (4GB memory limit)
yarn dev            # Compile TS + watch, auto-restart on success

# Build
yarn build          # Compile TypeScript to dist/
yarn build:ubuntu   # Compile + copy assets to dist/src/assets (production)

# Database
yarn migrate        # Run TypeORM migrations (dev, uses ts-node)
yarn migrate:ubuntu # Run TypeORM migrations (prod, uses compiled JS)
yarn seed           # Seed database from src/db/index.ts
```

No test or lint commands are configured.

## Architecture

**Stack:** Express + TypeScript + TypeORM + MySQL. Uses `routing-controllers` for decorator-based route definitions.

**Entry point:** `src/app.ts` — sets up Express, registers controllers, configures middleware.

**Layer structure:**
- `src/controllers/` — HTTP handlers using `@JsonController`, `@Get`, `@Post` decorators. Base routes: `/api/auth`, `/api/admin`, `/api/advocate`, `/api/config`, `/api/email`, `/api/organization`, `/api/service-manager`, `/api/survival`
- `src/services/` — Business logic and database queries
- `src/middleware/` — JWT verification and role-based auth guards (one middleware per role type)
- `src/entity/` — TypeORM entities (18 tables). Database schema changes must go through migrations, not `synchronize` (disabled)
- `src/migrations/` — TypeORM migration files
- `src/helper/` — Cross-cutting utilities: JWT (`Jwt.helper.ts`), S3 (`S3UploadService.helper.ts`), response format (`ResponseFormatter.helper.ts`), email templates (`Emails.helper.ts`), file upload config (`MulterConfig.helper.ts`)
- `src/schema/` — Joi validation schemas
- `src/util/` — Business logic utilities shared across services

## Role System

Five roles with integer IDs used throughout middleware and entities:
- `1` = Admin
- `2` = Organization Admin
- `3` = Service Manager
- `4` = Advocate
- `5` = Survivor

Role constants are defined in `src/helper/Constants.helper.ts`.

## API Response Format

All responses use `ResponseFormatter.helper.ts`:
```json
{ "status": "OK|ERROR|UNAUTHORIZED|FORBIDDEN|SERVER ERROR", "message": "...", "data": {} }
```
HTTP status codes: 200 (success), 400 (error), 401 (unauthorized), 403 (forbidden), 500 (server error).

## Database

- MySQL, database name `atlas_free_server`, default port 3306
- ORM config in `ormconfig.ts` — reads from env vars with localhost/root defaults
- `synchronize` is disabled — always create a migration for schema changes
- Migration command targets `src/migrations/*.ts` in dev, `src/migrations/*.js` in prod

## Environment

Key `.env` variables: `PORT` (default 3003), `DB_HOST/DB_USER/DB_PASSWORD/DB_NAME`, `JWT_SECRET`, `TOKEN_EXPIRY`, `INTERNAL_API_KEY`, `SITE_NAME` (frontend URL), `MAIL_*` (SMTP), `AWS_*` (S3), `SUPER_ADMIN_MAIN`.

## TypeScript Notes

- `strict: false` — no strict null checks
- `emitDecoratorMetadata: true` and `experimentalDecorators: true` required for TypeORM and routing-controllers
- Path aliases configured via `tsconfig-paths`
- Output: `dist/`

## Deployment

Deployed via Bitbucket Pipelines on the `staging` branch. Build step runs `yarn build:ubuntu`; deploy step SSH-pulls to remote server and reloads with PM2.

## Repository
- Push to both repos
