# AgendaMeets

Sistema de gerenciamento de agendamentos para equipes de atendimento, com autenticação via Google e importação de dados a partir do Google Sheets.

## Funcionalidades

- Listagem de agendamentos com filtros por período e atendente (filtros salvos no localStorage)
- Criação, edição e exclusão de agendamentos via modal
- Alertas sonoros no browser antes do início de cada agendamento (configurável por atendente ou por agendamento)
- Importação de agendamentos a partir de uma planilha Google Sheets
- CRUD de atendentes e assuntos
- Acesso restrito a contas `@clinicaexperts.com.br` via Google OAuth

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Banco de dados | PostgreSQL via Prisma 6 |
| Autenticação | NextAuth v5 (Google OAuth) |
| Integrações | Google Sheets API v4 |
| Runtime | Node.js 24 |

## Arquitetura

```
agendameets-sup/
├── app/
│   ├── layout.js              # Layout raiz (html/body)
│   ├── login/                 # Página de login pública
│   └── (home)/                # Grupo de rotas autenticadas
│       ├── layout.js          # Injeta sidebar e providers
│       ├── page.js            # Dashboard
│       ├── agendamentos/      # Lista com filtros e paginação
│       ├── atendentes/        # CRUD de atendentes
│       ├── assuntos/          # CRUD de assuntos
│       └── api/               # Route Handlers
│           ├── agendamentos/  # GET (paginado), POST, PUT, DELETE
│           ├── atendentes/    # CRUD
│           ├── assuntos/      # CRUD
│           ├── status/        # GET
│           └── sync-sheets/   # POST — importa da planilha
├── components/
│   ├── Header/                # Sidebar colapsável de navegação
│   ├── Providers.jsx          # SessionProvider + AlertaProvider
│   ├── AgendamentoModal.jsx   # Modal de criação/edição
│   ├── AlertaModal.jsx        # Modal de notificação de alerta
│   ├── AlertaProvider.jsx     # Gerencia estado do alerta ativo
│   ├── AssuntoModal.jsx       # Modal de assunto
│   └── AtendenteModal.jsx     # Modal de atendente
├── hooks/
│   └── useAlertaAgendamentos.js  # Polling + timers de alerta
├── lib/
│   └── sheets.js              # Cliente Google Sheets (service account)
├── auth.js                    # NextAuth com callbacks de domínio e atendenteId
├── auth.config.js             # Configuração edge-safe do provider Google
├── middleware.js              # Proteção de rotas via NextAuth
└── prisma/
    ├── schema.prisma          # Schema do banco de dados
    └── migrations/            # Histórico de migrações
```

### Modelos de dados

- **Atendente** — `nome`, `ativo`, `email` (único, usado para vincular ao login), `alertaMinutos` (antecedência padrão do alerta)
- **Agendamento** — `dataHoraInicio`, `dataHoraFim`, `cliente`, `linkUmbler`, `observacoes`, `alertaMinutos` (sobrescreve o do atendente); FK para Atendente e Status; M2M com Assunto
- **Assunto** — categoria/tema da reunião (muitos para muitos com Agendamento)
- **Status** — estado do agendamento com cor em hex para badge visual

### Sistema de alertas

O hook `useAlertaAgendamentos` roda no cliente e faz polling a cada 60 segundos para buscar os agendamentos do dia do atendente logado. Para cada um, agenda um `setTimeout` para disparar `alertaMinutos` antes do início — tocando um alarme de áudio via Web Audio API e exibindo um modal de notificação.

### Autenticação

Login exclusivo via Google OAuth. Apenas e-mails do domínio `@clinicaexperts.com.br` são aceitos. O JWT armazena o `atendenteId` do usuário, resolvido pelo e-mail na tabela `Atendente`, e fica disponível em `session.atendenteId` no cliente.

### Importação via Google Sheets

`POST /api/sync-sheets` lê o intervalo `A7:J` da planilha configurada e importa agendamentos. Atendentes, status e assuntos são criados automaticamente se não existirem. O campo `linkUmbler` é usado como chave de deduplicação — linhas sem ele são ignoradas.

## Configuração

### Pré-requisitos

- Node.js 24+
- PostgreSQL rodando localmente

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendameets"

# NextAuth
AUTH_SECRET="sua-chave-secreta"
AUTH_GOOGLE_ID="seu-google-client-id"
AUTH_GOOGLE_SECRET="seu-google-client-secret"

# Google Sheets (service account)
GOOGLE_SERVICE_ACCOUNT_JSON='{ ... }'
GOOGLE_SHEET_ID="id-da-planilha"
```

### Instalação e execução

```bash
npm install

# Rodar as migrações e gerar o cliente Prisma
npx prisma migrate dev

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:3000`.

### Outros comandos

```bash
npx prisma studio        # Interface visual para inspecionar o banco
npx prisma generate      # Regenerar o cliente após alterar o schema
npm run build            # Build de produção (inclui prisma generate)
```
