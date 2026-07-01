# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # prisma generate + next build
npx prisma migrate dev   # Run migrations and regenerate client
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma studio        # Open Prisma Studio to inspect the database
```

No lint or test scripts configured.

## Architecture

Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + Prisma 6 + PostgreSQL + NextAuth v5.

### App structure

```
app/
├── layout.js              # Root layout (html/body only)
├── globals.css
├── login/                 # Public login page (Google OAuth)
└── (home)/                # Route group — all authenticated pages
    ├── layout.js          # Wraps with Providers + Header sidebar
    ├── page.js            # Dashboard (home)
    ├── agendamentos/      # Appointment list with filters
    ├── atendentes/        # Attendant CRUD
    ├── assuntos/          # Subject CRUD
    └── api/
        ├── agendamentos/  # GET (paginated+filtered), POST, PUT, DELETE
        ├── atendentes/    # GET, POST, PUT, DELETE
        ├── assuntos/      # GET, POST, PUT, DELETE
        ├── status/        # GET
        ├── sync-sheets/   # POST — import from Google Sheets
        └── test-sheets/   # GET — debug endpoint for Sheets integration

components/
├── Header/Header.jsx      # Collapsible sidebar navigation
├── Providers.jsx          # SessionProvider + AlertaProvider wrapper
├── AgendamentoModal.jsx   # Create/edit appointment modal
├── AlertaModal.jsx        # Upcoming appointment notification modal
├── AlertaProvider.jsx     # Schedules audio alerts from session data
├── AssuntoModal.jsx       # Create/edit subject modal
└── AtendenteModal.jsx     # Create/edit attendant modal

hooks/
└── useAlertaAgendamentos.js  # Polls API every 60s; fires browser audio alarms

lib/
└── sheets.js              # Google Sheets read client (service account auth)

prisma/
├── schema.prisma          # Source of truth for DB schema
└── migrations/            # Migration history

middleware.js              # NextAuth middleware — protects all routes except /login, /api, _next
auth.js                    # NextAuth config with domain-restricted signIn + atendenteId in JWT
auth.config.js             # Google provider + pages config (edge-safe, no Prisma)
```

### Data models

| Model | Key fields |
|---|---|
| `Atendente` | `nome`, `ativo`, `email?` (unique), `alertaMinutos?` (default 30) |
| `Agendamento` | `dataHoraInicio`, `dataHoraFim`, `cliente`, `linkUmbler?`, `observacoes?`, `alertaMinutos?`, FK to Atendente/Status, M2M to Assunto |
| `Assunto` | `descricao`, M2M to Agendamento |
| `Status` | `descricao`, `corHex` (hex color for badge display) |

`Agendamento` ↔ `Assunto` is **many-to-many** (implicit join table). `Agendamento` → `Status` and `Agendamento` → `Atendente` are many-to-one FKs.

### Alert system

`useAlertaAgendamentos` (client hook) polls `/api/agendamentos` every 60 s for the current user's appointments today. For each one, it schedules a `setTimeout` to fire `alertaMinutos` before start (falling back to `atendente.alertaMinutos`, then 30). On trigger, it plays a browser audio alarm and opens `AlertaModal`. `AlertaProvider` wraps the authenticated layout and holds the active alert state.

### Authentication

NextAuth v5 (App Router handlers at `app/api/auth/[...nextauth]`). Google OAuth only. `signIn` callback restricts login to `@clinicaexperts.com.br` emails. The `jwt` callback resolves the user's `Atendente.id` by email and stores it as `token.atendenteId`; `session.atendenteId` is then available client-side via `useSession`.

### Sheets sync

`POST /api/sync-sheets` reads range `A7:J` from the configured Google Sheet, creates missing Atendente/Status/Assunto records on-the-fly, and upserts Agendamentos using `linkUmbler` as the deduplication key. Rows without a valid `http` linkUmbler are skipped.

### External integrations

- **PostgreSQL** — `DATABASE_URL`
- **Google Sheets** — `GOOGLE_SERVICE_ACCOUNT_JSON` (full JSON), `GOOGLE_SHEET_ID`. Read-only (`spreadsheets.readonly`). Helper in `lib/sheets.js` accepts a range string.
- **Google OAuth** — `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`

### Path alias

`@` maps to the project root, e.g. `import { getSheetData } from "@/lib/sheets"`.
