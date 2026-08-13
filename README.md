# EduHousing

Platform for student-to-student housing handover.

## Requirements
- Node.js 22 (`nvm use`)
- npm 10+
- Docker & Docker Compose

## Getting started
```bash
git clone git@github.com:eduhousing/eduhousing.git
cd eduhousing
cp .env.example .env
nvm use
npm install
docker compose up -d
npm run dev
```

Web: http://localhost:3000 · API: http://localhost:3001

## Project structure
| Path | Description |
|---|---|
| `apps/web` | Next.js web application |
| `apps/api` | Backend API |
| `apps/mobile` | Mobile application |
| `packages/shared` | Shared types and utilities |
| `infra` | Deployment and infrastructure |
| `docs` | Architecture, runbook, decision records |

## Configuration files explained

| File | Role |
|---|---|
| `.nvmrc` | Specifies the Node.js version (22). Run `nvm use` to automatically switch to the correct version. Ensures everyone on the team uses the same Node version. |
| `.editorconfig` | Standardizes code formatting across all editors (VS Code, WebStorm, etc.): 2-space indentation, UTF-8 encoding, LF line endings, trailing whitespace removal. Prevents PRs polluted with formatting-only changes. |
| `.env.example` | Template listing all required environment variables with placeholder values. Copy it to `.env` (`cp .env.example .env`) and fill in real values. `.env` is gitignored — secrets never go in the repo. |
| `.gitignore` | Lists files and folders that Git should not track: `node_modules/`, `dist/`, `.env`, logs, etc. Keeps the repo clean from generated or sensitive files. |
| `.gitkeep` | Empty placeholder file inside empty directories (`apps/web/`, `infra/`, etc.). Git does not track empty folders, so `.gitkeep` forces Git to keep them. Can be deleted once real files are added. |
| `docker-compose.yml` | Defines the local development services. Currently starts a PostgreSQL 16 database. One command (`docker compose up -d`) gives everyone the same database setup — no manual installation needed. Each developer gets their own local database. |
| `package.json` | Root config for the npm monorepo. Declares workspaces (`apps/*`, `packages/*`) so a single `npm install` handles all sub-projects. Contains shared scripts: `dev`, `build`, `lint`, `format`, `test`. |
| `.github/workflows/ci.yml` | GitHub Actions CI pipeline. Runs automatically on every PR and push to `main`: installs dependencies, lints, builds, and runs tests. A PR cannot be merged unless CI passes. |
| `.github/pull_request_template.md` | Pre-fills the PR description with a checklist (description, ClickUp link, how to test, CI check). Ensures every PR has the required information. |

## Team
| Name | Role |
|---|---|
| … | Tech lead / Infrastructure |
| … | Backend / Data |
| … | Frontend / Mobile |
| … | Product / Quality |

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md).
