# Frontend Challenge — Design

## Contexto

Frontend completo de um mini-SaaS administrativo (estilo sistema admin), que será disponibilizado publicamente como desafio para alunos implementarem o backend (API REST + banco de dados). O frontend não possui nenhum dado mockado: toda informação exibida vem exclusivamente da API que os alunos vão construir, seguindo o contrato documentado neste repositório.

## Objetivo

Entregar:

1. Uma aplicação React funcional, com CRUD completo de Alunos, Professores e Disciplinas, mais uma Dashboard de resumo.
2. Um contrato de API (OpenAPI + Swagger UI estático) que os alunos usam como especificação para implementar o backend.
3. Uma imagem Docker do frontend e instruções de setup, para que qualquer aluno consiga rodar o frontend apontando para a própria API.

## Stack

React + Vite + TypeScript, React Router, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form + Zod, Axios, TanStack Query. Sem GraphQL, sem dados locais/mocks/faker.

## Estrutura do repositório (monorepo)

```
frontend-challenge/
├── src/
│   ├── api/
│   │   ├── client.ts             # instância axios (baseURL = VITE_API_URL)
│   │   └── entityFactory.ts      # factory genérica de hooks CRUD (TanStack Query)
│   ├── types/
│   │   ├── aluno.ts
│   │   ├── professor.ts
│   │   └── disciplina.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── useDashboardSummary.ts
│   │   ├── alunos/
│   │   │   ├── AlunosPage.tsx
│   │   │   ├── AlunoFormFields.tsx
│   │   │   ├── alunoSchema.ts
│   │   │   └── useAlunos.ts
│   │   ├── professores/          # mesmo padrão de alunos/
│   │   └── disciplinas/          # mesmo padrão, + selects de professor/alunos
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── shared/
│   │   │   ├── DataTable.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   ├── SectionCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── FormModal.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── ui/                   # componentes shadcn
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx                   # rotas
│   └── main.tsx
├── contract/
│   ├── openapi.yaml               # contrato fonte da verdade
│   ├── index.html                 # Swagger UI estático (lê openapi.yaml local)
│   └── README.md                  # como visualizar/consumir o contrato
├── public/
├── .env.example
├── Dockerfile                     # multi-stage: build Vite -> nginx
├── nginx.conf                     # fallback de SPA
├── README.md                      # overview do desafio, setup, docker
├── package.json / vite.config.ts / tsconfig.json / tailwind.config.ts
```

## Modelo de dados

**Aluno**
| campo | tipo | obrigatório |
|---|---|---|
| id | number | gerado pela API |
| nome | string | sim |
| email | string | sim |
| matricula | string | sim |
| dataNascimento | string (`YYYY-MM-DD`) | sim |
| status | `"ativo"` \| `"inativo"` | sim (default `ativo`) |

**Professor**
| campo | tipo | obrigatório |
|---|---|---|
| id | number | gerado pela API |
| nome | string | sim |
| email | string | sim |
| especialidade | string | sim |
| status | `"ativo"` \| `"inativo"` | sim (default `ativo`) |

**Disciplina**
| campo | tipo | obrigatório |
|---|---|---|
| id | number | gerado pela API |
| nome | string | sim |
| cargaHoraria | number (horas) | sim |
| professorId | number | sim (exatamente 1 professor) |
| alunosIds | number[] | sim (1 ou mais alunos) |

Disciplina guarda apenas os IDs de professor/alunos — sem objetos aninhados no GET. O frontend já carrega `/professores` e `/alunos` (para alimentar os selects do formulário) e reaproveita esse cache do TanStack Query para resolver nome do professor e contagem/lista de alunos na tabela de Disciplinas. Isso mantém a listagem simples de implementar no backend (sem exigir joins).

## Contrato de API

Base REST, JSON, sem paginação/busca no servidor (filtros e paginação são 100% client-side sobre a lista completa já carregada).

```
GET    /alunos            -> Aluno[]
POST   /alunos            -> Aluno (201)
PUT    /alunos/:id        -> Aluno (200)
DELETE /alunos/:id        -> (204)

GET    /professores       -> Professor[]
POST   /professores       -> Professor (201)
PUT    /professores/:id   -> Professor (200)
DELETE /professores/:id   -> (204)

GET    /disciplinas       -> Disciplina[]
POST   /disciplinas       -> Disciplina (201)
PUT    /disciplinas/:id   -> Disciplina (200)
DELETE /disciplinas/:id   -> (204)
```

Sem endpoint dedicado de dashboard: os totais exibidos são `array.length` das 3 listagens acima, compartilhando cache do TanStack Query entre as páginas.

**Erros**: qualquer falha (400/404/409/500) retorna corpo `{ "message": string }`. O frontend exibe essa mensagem diretamente (via toast em mutations, via `ErrorState` em falhas de listagem). Regras de negócio como impedir exclusão de um professor/aluno referenciado em uma disciplina são decisão do backend de cada aluno; o frontend apenas repassa a mensagem de erro retornada.

O `openapi.yaml` em `contract/` é a fonte da verdade formal deste contrato (schemas, exemplos de request/response, códigos de status).

## Arquitetura frontend

- **Camada de API**: uma factory genérica `createEntityHooks<T>(endpoint)` gera `useList`, `useCreate`, `useUpdate`, `useDelete` via TanStack Query, reaproveitada pelas 3 entidades. Mutations invalidam a query de listagem correspondente e disparam toast de sucesso/erro automaticamente.
- **Formulários**: `FormModal` é um shell genérico (título, corpo, footer com botões, estado de loading/disabled durante envio) que recebe como conteúdo o formulário específico de cada entidade (react-hook-form + schema Zod próprio). A parte repetitiva (modal, chamadas de API, cache) fica centralizada; o que realmente difere entre entidades (campos, selects da Disciplina) fica explícito em cada `features/*/`.
- **Roteamento**: React Router, rotas `/` (Dashboard), `/alunos`, `/professores`, `/disciplinas`, todas dentro do `AppShell` (Sidebar fixa + Header).

## Telas e fluxos

Todas as telas de CRUD seguem o mesmo padrão:

`PageHeader` (título + descrição) → área de filtros (`SearchInput` por texto + um `Select` de filtro contextual) + botão principal "Novo" → `SectionCard` contendo `DataTable` (paginação client-side, ~10 itens/página) → estados de Loading / Erro (com botão de retry) / Vazio (`EmptyState` com CTA para criar o primeiro registro).

- **Alunos** — colunas: nome, email, matrícula, status (`StatusBadge`), ações (editar/excluir). Filtro: texto (nome/email/matrícula) + status. Form: nome, email, matrícula, data de nascimento, status.
- **Professores** — colunas: nome, email, especialidade, status, ações. Filtro: texto + status. Form: nome, email, especialidade, status.
- **Disciplinas** — colunas: nome, carga horária, professor responsável (nome resolvido via cache), nº de alunos matriculados, ações. Filtro: texto (nome) + professor responsável. Form: nome, carga horária, select único de professor (obrigatório), multi-select de alunos (obrigatório, 1+). Para o multi-select, verificar primeiro se há um componente consolidado no registry do shadcn antes de compor um customizado (Popover + Command + Badge é o padrão de fallback).
- **Dashboard** — 3 `SectionCard` (ícone Lucide + número + rótulo: Total de Alunos, Total de Professores, Total de Disciplinas). Sem filtros, sem tabela. Loading/Erro agregados da página enquanto as 3 listagens carregam.
- **Exclusão** — sempre via `ConfirmDialog` (AlertDialog do shadcn), em qualquer entidade.

## Componentes reutilizáveis

`DataTable`, `PageHeader`, `PageContainer`, `SectionCard`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, `FormModal`, `SearchInput`, `StatusBadge` — construídos uma vez em `components/shared/` e reaproveitados pelas 4 páginas. Nenhuma tela cria uma variante própria desses padrões.

## UX e visual

- shadcn/ui com base de cor neutra e indigo como cor de destaque (botões primários, links ativos da sidebar, estados de foco).
- Toasts via `sonner` para sucesso/erro de criar, editar e excluir.
- Sidebar fixa em desktop/notebook; colapsa/vira off-canvas em telas de tablet (~1024px). Mobile não é prioridade.
- Botões de ação desabilitados durante submissão; toda mutation mostra estado de loading visível.

## Docker e entrega

- `Dockerfile` multi-stage: stage 1 (`node:alpine`) builda a app Vite recebendo `VITE_API_URL` como build-arg (variáveis Vite são embutidas em build-time); stage 2 (`nginx:alpine`) serve os arquivos estáticos com fallback de SPA (`nginx.conf`).
- `.env.example` documentando `VITE_API_URL`.
- `README.md` raiz cobre: visão geral do desafio, stack, setup local (`npm install`, `npm run dev`), variáveis de ambiente, como buildar/rodar via Docker, e um resumo legível do contrato de API com link para `contract/`.
- `contract/README.md` explica como abrir o `index.html` (Swagger UI estático apontando para `openapi.yaml` local, sem necessidade de build) para consulta interativa do contrato.

## Fora de escopo

- Autenticação/login.
- Endpoint de busca no servidor ou paginação server-side.
- Suíte de testes automatizados (verificação será manual, via browser, durante a implementação).
- Suporte mobile.
