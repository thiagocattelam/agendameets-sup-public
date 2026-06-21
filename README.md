# AgendaMeets

Sistema de gerenciamento de reuniões integrado ao Google Sheets e Google Agenda, com autenticação via Google.

## Finalidade

O AgendaMeets permite que equipes de atendimento registrem, visualizem e gerenciem agendamentos de reuniões diretamente pela plataforma. Os dados são sincronizados com uma planilha Google Sheets e os eventos são refletidos no Google Agenda. O acesso é feito exclusivamente via login com conta Google.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Banco de dados | PostgreSQL via Prisma 6 |
| Integrações | Google Sheets API v4, Google Calendar API, Google OAuth |
| Runtime | Node.js 24 |

## Arquitetura

```
agendameets-sup/
├── app/
│   ├── layout.js          # Layout raiz com a sidebar
│   ├── page.js            # Dashboard
│   ├── atendentes/        # CRUD de atendentes
│   ├── assuntos/          # Gerenciamento de assuntos
│   └── api/               # Route Handlers do Next.js
│       └── test-sheets/   # Endpoint de teste da integração com Sheets
├── components/
│   └── Header/            # Sidebar colapsável de navegação
├── lib/
│   ├── sheets.js          # Cliente de leitura do Google Sheets
│   └── generated/prisma/  # Cliente Prisma gerado (não editar)
└── prisma/
    ├── schema.prisma      # Schema do banco de dados
    └── migrations/        # Histórico de migrações
```

### Modelos de dados

- **Atendente** — usuário que realiza os atendimentos (`nome`, `ativo`)
- **Agendamento** — registro de uma reunião (`dataHoraInicio`, `dataHoraFim`, `cliente`, `linkUmbler`, `observacoes`, FK para Atendente, Assunto e Status)
- **Assunto** — categoria/tema da reunião
- **Status** — estado do agendamento com cor em hex para exibição visual

## Configuração

### Pré-requisitos

- Node.js 24+
- PostgreSQL rodando localmente

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendameets"

# JSON completo da service account do Google
GOOGLE_SERVICE_ACCOUNT_JSON='{ ... }'

# ID da planilha Google Sheets (encontrado na URL da planilha)
GOOGLE_SHEET_ID="seu-sheet-id"
```

### Instalação e execução

```bash
npm install

# Rodar as migrações e gerar o cliente Prisma
npx prisma migrate dev

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

### Outros comandos úteis

```bash
npx prisma studio        # Interface visual para inspecionar o banco
npx prisma generate      # Regenerar o cliente após alterar o schema
```
