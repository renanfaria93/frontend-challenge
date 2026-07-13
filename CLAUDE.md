# CLAUDE.md

Orientações para trabalhar neste repositório. Contexto completo do projeto está em [docs/superpowers/specs/2026-07-13-frontend-challenge-design.md](docs/superpowers/specs/2026-07-13-frontend-challenge-design.md) — leia antes de qualquer tarefa maior.

## Sobre o projeto

Frontend de um desafio para alunos implementarem backend. **Não existe backend neste repositório.** Toda informação exibida vem exclusivamente de uma API REST externa, consumida via Axios + TanStack Query, seguindo o contrato em `api-contract/openapi.yaml`.

## Regra fundamental — sem dados falsos

- Nunca usar dados mockados, faker, JSON local, fixtures ou MSW/json-server.
- Lista vazia retornada pela API → renderizar `EmptyState`, nunca inventar dado.
- Nenhum componente deve funcionar sem a chamada de API real por trás.

## Stack obrigatória

React + Vite + TypeScript, React Router, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form + Zod, Axios, TanStack Query. Sem GraphQL.

## Estrutura de pastas

```
src/api/            client axios + entityFactory (hooks CRUD genéricos)
src/types/          tipos das 3 entidades (Aluno, Professor, Disciplina)
src/features/<entidade>/   página + form fields + schema Zod + hooks específicos
src/components/layout/     AppShell, Sidebar, Header
src/components/shared/     componentes reutilizáveis (ver lista abaixo)
src/components/ui/         componentes shadcn
api-contract/               openapi.yaml + Swagger UI estático (fonte da verdade da API)
```

## Padrões de código obrigatórios

- **CRUD**: usar a factory genérica (`createEntityHooks<T>(endpoint)`) para `useList/useCreate/useUpdate/useDelete`. Nunca duplicar lógica de fetch por entidade.
- **Criar/editar**: sempre via `FormModal` (shell genérico + conteúdo específico da entidade). Nunca criar página separada de criação/edição.
- **Excluir**: sempre via `ConfirmDialog`.
- **Reuso obrigatório**: antes de criar qualquer componente novo, verificar se já existe em `components/shared/`: `DataTable`, `PageHeader`, `PageContainer`, `SectionCard`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, `FormModal`, `SearchInput`, `StatusBadge`.
- **shadcn/ui primeiro**: sempre usar/instalar um componente pronto do shadcn antes de construir algo do zero (checar o registry, inclusive para casos como multi-select).
- **Forms**: React Hook Form + Zod, um schema por entidade (`features/<entidade>/<entidade>Schema.ts`).
- **Feedback**: toasts via `sonner` em toda mutation (sucesso e erro); botões desabilitados durante submissão.
- **Tipagem**: forte, sem `any`. Tipos de entidade centralizados em `src/types/`.
- **Domínio em português**: campos de entidade e labels de UI em português (`nome`, `matricula`, `cargaHoraria`, `professorId`, `alunosIds`), para bater com o domínio do desafio. Nomes técnicos (funções, hooks, componentes) em inglês, padrão do ecossistema React.
- **Cores/tema**: base neutra + indigo como destaque (já configurado via shadcn).

## Design visual — skill obrigatória

Qualquer tarefa visual — criar uma tela nova, um componente de UI, ajustar layout/espaçamento/cor/tipografia — **deve invocar a skill `frontend-design` antes de implementar**, mesmo em ajustes pequenos. Não pular essa etapa.

## Contrato de API

`api-contract/openapi.yaml` é a fonte da verdade. Nunca inventar endpoint, campo ou comportamento fora dele. Erros da API sempre no formato `{ "message": string }`. Listagens retornam array direto (sem envelope), sem paginação/busca no servidor — filtros e paginação são client-side sobre os dados já carregados.

## O que não fazer

- Não criar backend, mock server, MSW ou json-server.
- Não adicionar autenticação/login (fora de escopo).
- Não criar endpoint de busca nem paginação server-side.
- Não adicionar suíte de testes automatizados a menos que explicitamente solicitado.
- Não commitar sem pedido explícito do usuário.
