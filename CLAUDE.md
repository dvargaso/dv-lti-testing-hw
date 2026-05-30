# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LTI is a full-stack Applicant Tracking System (ATS). Backend is Express + TypeScript with Prisma ORM using PostgreSQL. Frontend is React (Create React App) with React Bootstrap and react-beautiful-dnd for kanban boards.

## Commands

### Setup (first time)
```sh
docker-compose up -d                         # start PostgreSQL
cd backend && npx prisma generate
cd backend && npx prisma migrate dev
cd backend && ts-node prisma/seed.ts         # seed example data
```

### Backend (`backend/`)
```sh
npm run dev          # dev server with hot-reload (ts-node-dev, port 3010)
npm run build        # compile TypeScript to dist/
npm start            # run compiled dist/index.js
npm test             # run Jest tests
```

### Frontend (`frontend/`)
```sh
npm start            # dev server (port 3000)
npm run build        # production build
npm test             # run tests
```

### Linting
ESLint is configured with Prettier (`backend/.eslintrc.js`). Formatting rules: single quotes, trailing commas.

## Architecture

The backend follows **Domain-Driven Design (DDD)** with a layered structure:

```
backend/src/
  domain/models/        # Domain entities (Candidate, Position, Application, etc.)
                        # Models use an Active Record pattern — each has a save() method
                        # that interacts with Prisma directly
  application/services/ # Orchestrates domain models; contains business logic
                        # (candidateService.ts, positionService.ts)
  application/validator.ts  # Input validation before domain operations
  presentation/controllers/ # Express request/response handlers; thin layer that calls services
  routes/               # Express route definitions wiring URLs to controllers
```

**Key flow**: route → controller → service (validate + orchestrate) → domain model `.save()` → Prisma → PostgreSQL.

The `prisma` instance is attached to every Express `req` object via middleware (`req.prisma`).

## Domain Model

Core entities and relationships (see `backend/prisma/schema.prisma` for full schema):
- `Candidate` has `Education[]`, `WorkExperience[]`, `Resume[]`, `Application[]`
- `Position` belongs to a `Company` and has an `InterviewFlow` (ordered `InterviewStep[]`)
- `Application` tracks a candidate's current `InterviewStep` within a position
- `Interview` records the outcome of a specific step for an application

API endpoints are documented in `backend/api-spec.yaml`. Data model diagram in `backend/ModeloDatos.md`.

## Testing

Test files live alongside source files (`candidateService.test.ts`, `candidateController.test.ts`). Jest uses `ts-jest`. Run a single test file:
```sh
cd backend && npx jest src/application/services/candidateService.test.ts
```

For E2E testing with Cypress, see [e2e.md](./e2e.md).

## Environment Variables

Root `.env` controls docker-compose (`DB_PASSWORD`, `DB_USER`, `DB_NAME`, `DB_PORT`). Backend `backend/.env` sets `DATABASE_URL` for Prisma.
