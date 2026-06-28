# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npx prisma migrate dev   # Run migrations and regenerate client
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma studio        # Open Prisma Studio to inspect the database
```

No lint or test scripts configured.

## Architecture

Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + Prisma 6 + PostgreSQL.

### App structure

- `app/` — pages using the App Router. Server Components by default; add `"use client"` when needed.
- `app/api/` — API Route Handlers (Next.js Route Handlers, not Pages Router).
- `components/Header/Header.jsx` — collapsible sidebar (not a top bar), shared via `app/layout.js`.
- `lib/sheets.js` — Google Sheets read client, authenticated via service account.
- `lib/generated/prisma/` — stale generated client from a previous setup; **do not use**. The active client is generated into `node_modules/.prisma/client` (via `npx prisma generate`) and imported via `@prisma/client`.
- `prisma/schema.prisma` — source of truth for the DB schema.
- `prisma.config.ts` — Prisma config; loads `.env` via `dotenv/config`.

### Data models

| Model | Key fields |
|---|---|
| `Atendente` | `nome`, `ativo` |
| `Agendamento` | `dataHoraInicio/Fim`, `cliente`, `linkUmbler?`, `observacoes?`, FK to Atendente/Assunto/Status |
| `Assunto` | `descricao` |
| `Status` | `descricao`, `corHex` (hex color for badge display) |

### External integrations

- **PostgreSQL** — connection string in `DATABASE_URL` env var.
- **Google Sheets** — service account credentials in `GOOGLE_SERVICE_ACCOUNT_JSON` (full JSON), sheet ID in `GOOGLE_SHEET_ID`. Data is read-only (`spreadsheets.readonly` scope). Helper in `lib/sheets.js` accepts a range string (e.g. `"A7:J"`).

### Path alias

`@` maps to the project root, e.g. `import { getSheetData } from "@/lib/sheets"`.
