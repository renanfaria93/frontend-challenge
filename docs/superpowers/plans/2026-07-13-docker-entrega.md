# Docker + Entrega Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Empacotar o frontend em uma imagem Docker (multi-stage: build Vite → nginx servindo estático com fallback de SPA) e documentar, no `README.md` raiz e em `api-contract/README.md`, tudo que um aluno precisa para rodar o frontend apontando para a própria API.

**Architecture:** Stage 1 builda a aplicação Vite recebendo `VITE_API_URL` como build-arg (variáveis Vite são embutidas no bundle em build-time, não em runtime). Stage 2 copia o output estático (`dist/`) para uma imagem `nginx:alpine`, com `nginx.conf` fazendo fallback de todas as rotas para `index.html` (necessário para o React Router funcionar em refresh/deep-link).

**Tech Stack:** Docker (multi-stage build), nginx.

## Global Constraints

(Herdadas do plano de Fundação — `docs/superpowers/plans/2026-07-13-fundacao.md`.)

- `VITE_API_URL` é embutida em build-time — deve ser passada como `--build-arg` no `docker build`, não como variável de runtime do container.
- Sem suíte de testes automatizados — verificação manual via `docker build` + `docker run` + checagem no navegador.
- Não commitar sem pedido explícito do usuário — os commits deste plano fazem parte da execução já aprovada.

## Pré-requisito

Este plano assume que o plano de Fundação já foi executado (o projeto builda com `npm run build`, gerando `dist/`) e idealmente que os planos de CRUD e Dashboard também, para que a imagem Docker sirva a aplicação completa. Requer Docker instalado na máquina de quem executar a Task 1.

---

### Task 1: `Dockerfile` multi-stage + `nginx.conf` + `.dockerignore`

**Files:**
- Create: `Dockerfile`, `nginx.conf`, `.dockerignore`

**Interfaces:**
- Produces: imagem Docker que serve a aplicação buildada na porta 80 (mapeável para qualquer porta do host), com fallback de SPA para todas as rotas do React Router (`/`, `/alunos`, `/professores`, `/disciplinas`).

- [ ] **Step 1: Criar `.dockerignore`**

```
node_modules
dist
.git
.env
docs
```

- [ ] **Step 2: Criar `nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 3: Criar `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 4: Buildar a imagem**

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend-challenge .
```

Esperado: build conclui sem erros, terminando com a imagem `frontend-challenge` criada (`docker images | grep frontend-challenge` lista a imagem).

- [ ] **Step 5: Rodar o container e verificar no navegador**

```bash
docker run --rm -p 8080:80 frontend-challenge
```

Abrir `http://localhost:8080/` no navegador e confirmar:
- A Dashboard carrega (mesmo que mostre `ErrorState`, caso nenhuma API esteja acessível em `http://localhost:3000` a partir do navegador — o importante é que a aplicação estática carregou e está rodando via nginx).
- Navegar diretamente para `http://localhost:8080/alunos` (deep-link, sem clicar na sidebar) carrega a tela corretamente em vez de retornar 404 do nginx — confirma que o fallback de SPA em `nginx.conf` está funcionando.

Encerrar o container com `Ctrl+C` (ou `docker stop` em outro terminal) depois de verificar.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: adiciona Dockerfile multi-stage e nginx.conf com fallback de SPA"
```

---

### Task 2: `README.md` raiz

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes (referencia, não importa em código): `.env.example` (plano de Fundação), `api-contract/openapi.yaml` e `api-contract/README.md` (Task 3), `Dockerfile` (Task 1)

- [ ] **Step 1: Criar `README.md`**

```markdown
# Frontend Challenge

Frontend completo de um mini-SaaS administrativo, disponibilizado como desafio para você implementar o backend (API REST + banco de dados). Este repositório **não contém nenhum backend nem dado mockado** — toda informação exibida na tela vem da API que você vai construir, seguindo o contrato documentado em [`api-contract/`](./api-contract).

## O desafio

Implemente uma API REST (na linguagem/framework de sua escolha) que sirva o CRUD de três entidades — **Alunos**, **Professores** e **Disciplinas** — seguindo exatamente o contrato descrito em [`api-contract/openapi.yaml`](./api-contract/openapi.yaml). Depois de rodar sua API, aponte este frontend para ela (via `VITE_API_URL`) e todas as telas passam a funcionar com dados reais.

## Stack do frontend

React + Vite + TypeScript, React Router, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form + Zod, Axios, TanStack Query.

## Rodando localmente

Pré-requisitos: Node.js 20+ e uma API rodando localmente (ou acessível via URL).

```bash
npm install
cp .env.example .env
# edite .env se sua API não estiver em http://localhost:3000
npm run dev
```

Acesse `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL base da API REST que o frontend vai consumir | `http://localhost:3000` |

`VITE_API_URL` é embutida no bundle em **build-time** (comportamento padrão do Vite) — ao buildar a imagem Docker, ela precisa ser passada como build-arg (veja abaixo), não como variável de ambiente do container em runtime.

## Rodando com Docker

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend-challenge .
docker run -p 8080:80 frontend-challenge
```

Acesse `http://localhost:8080`. A chamada HTTP para a API acontece no navegador do usuário (não dentro do container) — aponte `VITE_API_URL` para um endereço acessível pelo navegador de quem for acessar a aplicação.

## Contrato de API (resumo)

Base REST, JSON, sem paginação/busca no servidor (filtros e paginação são 100% client-side sobre a lista completa já carregada):

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

Qualquer erro (400/404/409/500) deve retornar corpo `{ "message": string }` — o frontend exibe essa mensagem diretamente (via toast em mutations, via tela de erro em falhas de listagem).

A especificação completa (schemas, exemplos, códigos de status) está em [`api-contract/openapi.yaml`](./api-contract/openapi.yaml). Para consultar interativamente via Swagger UI, veja [`api-contract/README.md`](./api-contract/README.md).

## Modelo de dados

**Aluno**: `id`, `nome`, `email`, `matricula`, `dataNascimento` (`YYYY-MM-DD`), `status` (`"ativo" | "inativo"`).

**Professor**: `id`, `nome`, `email`, `especialidade`, `status` (`"ativo" | "inativo"`).

**Disciplina**: `id`, `nome`, `cargaHoraria` (número, horas), `professorId` (exatamente 1 professor), `alunosIds` (1 ou mais alunos). O `GET` de disciplina não retorna objetos aninhados — apenas os IDs; o frontend resolve o nome do professor e a lista de alunos matriculados a partir das listagens de `/professores` e `/alunos`, já carregadas em cache.

## Fora de escopo

Autenticação/login, busca ou paginação no servidor, suíte de testes automatizados, suporte mobile.
```

- [ ] **Step 2: Verificar**

Conferir manualmente que todos os links relativos do arquivo (`./api-contract`, `./api-contract/openapi.yaml`, `./api-contract/README.md`) apontam para caminhos que existem no repositório (os dois últimos são criados pelo plano de Fundação e pela Task 3 deste plano, respectivamente).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: adiciona README raiz com setup, docker e resumo do contrato"
```

---

### Task 3: `api-contract/README.md`

**Files:**
- Create: `api-contract/README.md`

**Interfaces:**
- Consumes (referencia, não importa em código): `api-contract/openapi.yaml`, `api-contract/index.html` (ambos do plano de Fundação)

- [ ] **Step 1: Criar `api-contract/README.md`**

```markdown
# Contrato de API

Este diretório contém a especificação formal da API que você deve implementar para o desafio.

- [`openapi.yaml`](./openapi.yaml) — especificação OpenAPI 3.0 completa (schemas, exemplos de request/response, códigos de status). É a fonte da verdade: qualquer divergência entre este README (ou o README raiz) e o `openapi.yaml` deve ser resolvida a favor do `openapi.yaml`.
- [`index.html`](./index.html) — Swagger UI estático que lê o `openapi.yaml` local, para consulta interativa sem precisar de build.

## Como visualizar interativamente

Abrir `index.html` diretamente como arquivo (`file://`) pode falhar ao carregar o `openapi.yaml` por restrição de CORS do navegador em arquivos locais. Sirva o diretório com qualquer servidor estático, por exemplo:

```bash
npx serve api-contract -l 4000
```

Depois abra `http://localhost:4000` no navegador.

## Como consumir

Qualquer ferramenta que leia OpenAPI 3.0 funciona com `openapi.yaml` — por exemplo, para gerar código cliente, importar em Postman/Insomnia, ou validar sua implementação de backend contra o contrato.
```

- [ ] **Step 2: Verificar**

```bash
npx serve api-contract -l 4000
```

Abrir `http://localhost:4000` e confirmar que o Swagger UI (`index.html`, já existente do plano de Fundação) continua carregando normalmente — este README não altera o comportamento do `index.html`, apenas o documenta.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: adiciona api-contract/README.md explicando como consultar o contrato"
```

---

## Self-Review desta plan

- **Cobertura do spec**: `Dockerfile` multi-stage (`node:alpine` build → `nginx:alpine` runtime) recebendo `VITE_API_URL` como build-arg ✅ (Task 1), `nginx.conf` com fallback de SPA ✅ (Task 1), `README.md` raiz cobrindo overview, stack, setup local, env vars, build/run via Docker e resumo do contrato com link para `api-contract/` ✅ (Task 2), `api-contract/README.md` explicando como abrir o Swagger UI estático ✅ (Task 3).
- **Placeholders**: nenhum — `Dockerfile`, `nginx.conf` e ambos os READMEs têm conteúdo completo.
- **Consistência**: o resumo do contrato de API no `README.md` raiz (Task 2) reflete exatamente as mesmas rotas e formato de erro definidos em `api-contract/openapi.yaml` (plano de Fundação, Task 16) — nenhum endpoint, campo ou comportamento inventado fora do contrato.
