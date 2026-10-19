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
npm run migrate
npm run seed
npm run dev
```

Web: http://localhost:3000 · API: http://localhost:3001

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API (port 3001) and the Next.js web app (port 3000) simultaneously |
| `npm run build` | Builds all workspaces (API, web, shared) for production |
| `npm run lint` | Runs ESLint on the entire codebase |
| `npm run format` | Formats all files with Prettier |
| `npm test` | Runs tests in all workspaces |
| `npm run migrate` | Runs database migrations (creates/updates tables in PostgreSQL) |
| `npm run seed` | Inserts test data into the database (users, listings, conversations, messages) |

## How it works

### The API (`apps/api`)
A NestJS 11 server that connects to PostgreSQL with raw SQL (pg, no ORM).

**Authentication (temporary):** Send the `x-user-id` header with a valid user UUID. This will be replaced by JWT.

**Routes:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check — returns `{ "status": "ok" }` |
| `GET` | `/listings` | No | Published listings (newest first, max 50, with photos) |
| `GET` | `/listings/mine` | Yes | All listings of the current user (including drafts) |
| `GET` | `/listings/:id` | No* | Single listing (*drafts/archived visible only to author) |
| `POST` | `/listings` | Yes | Create a listing (published by default) |
| `PATCH` | `/listings/:id` | Yes | Update a listing (author only) |
| `DELETE` | `/listings/:id` | Yes | Delete a listing and its photos (author only) |
| `POST` | `/listings/:id/photos` | Yes | Upload photos (JPEG/PNG/WebP, max 5 MB, max 10 per listing) |
| `DELETE` | `/listings/:id/photos/:photoId` | Yes | Delete a photo (author only) |

### The web app (`apps/web`)
A Next.js application. The homepage calls the API's `/health` endpoint and displays the result. This is the starting point to build the user interface (search, listings, profiles, etc.).

### Shared types (`packages/shared`)
TypeScript type definitions for the 5 database tables: `User`, `Listing`, `ListingPhoto`, `Conversation`, `Message`. Both the API and the web app import from this package so they always agree on data shapes.

### Database
PostgreSQL 16, running in Docker. The schema is managed through migrations (`npm run migrate`), not manually. The tables are:
- **users** — students, owners, admins
- **listings** — housing ads with rent, location, availability
- **listing_photos** — images attached to listings
- **conversations** — threads between two users about a listing
- **messages** — individual messages within a conversation

### Resetting the database
If you need a fresh start:
```bash
docker compose down -v    # deletes the container and all data
docker compose up -d      # recreates a blank database
npm run migrate           # recreates the tables
npm run seed              # reinserts test data
```

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
