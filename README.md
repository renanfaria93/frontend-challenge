# Frontend Challenge

Frontend completo de um mini-SaaS administrativo, disponibilizado como desafio para você implementar o backend (API REST + banco de dados). Este repositório **não contém nenhum backend nem dado mockado** — toda informação exibida na tela vem da API que você vai construir, seguindo o contrato documentado em [`contract/`](./contract).

## O desafio

Implemente uma API REST (na linguagem/framework de sua escolha) que sirva o CRUD de três entidades — **Alunos**, **Professores** e **Disciplinas** — seguindo exatamente o contrato descrito em [`contract/openapi.yaml`](./contract/openapi.yaml). Depois de rodar sua API, aponte o frontend para ela (via `VITE_API_URL`) e todas as telas passam a funcionar com dados reais.

## Estrutura do repositório

Monorepo com dois projetos independentes:

```
/frontend       aplicação React que consome a API (ver frontend/README.md)
/contract   especificação OpenAPI + Swagger UI (ver contract/README.md)
docker-compose.yml
```

## Rodando tudo com Docker

Pré-requisito: Docker e Docker Compose instalados.

```bash
git clone <url-deste-repositorio>
cd frontend-challenge
VITE_API_URL=http://localhost:3000 docker compose up --build
```

- Frontend: `http://localhost:8080`
- Swagger UI do contrato: `http://localhost:4000`

`VITE_API_URL` deve apontar para a API que você implementou (padrão `http://localhost:3000` se a variável for omitida). Ela é embutida no bundle em **build-time**, então trocar a URL exige `docker compose up --build` novamente.

Para rodar cada projeto individualmente (sem Docker, com hot-reload) veja [`frontend/README.md`](./frontend/README.md). Para consultar o contrato interativamente veja [`contract/README.md`](./contract/README.md).

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

A especificação completa (schemas, exemplos, códigos de status) está em [`contract/openapi.yaml`](./contract/openapi.yaml). Para consultar interativamente via Swagger UI, veja [`contract/README.md`](./contract/README.md).

## Modelo de dados

**Aluno**: `id`, `nome`, `email`, `matricula`, `dataNascimento` (`YYYY-MM-DD`), `status` (`"ativo" | "inativo"`).

**Professor**: `id`, `nome`, `email`, `especialidade`, `status` (`"ativo" | "inativo"`).

**Disciplina**: `id`, `nome`, `cargaHoraria` (número, horas), `professorId` (exatamente 1 professor), `alunosIds` (1 ou mais alunos). O `GET` de disciplina não retorna objetos aninhados — apenas os IDs; o frontend resolve o nome do professor e a lista de alunos matriculados a partir das listagens de `/professores` e `/alunos`, já carregadas em cache.

## Fora de escopo

Autenticação/login, busca ou paginação no servidor, suíte de testes automatizados, suporte mobile.
