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
