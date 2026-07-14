# Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a Dashboard com 3 `SectionCard` mostrando o total de Alunos, Professores e Disciplinas, sem filtros nem tabela, com loading/erro agregados enquanto as 3 listagens carregam.

**Architecture:** `features/dashboard/useDashboardSummary` combina `useAlunos`, `useProfessores` e `useDisciplinas` (reaproveitando o cache do TanStack Query já populado pelas outras páginas, sem endpoint dedicado de dashboard) e deriva `totals.{alunos,professores,disciplinas}` a partir de `array.length`. `DashboardPage` consome esse hook e renderiza os 3 cards.

**Tech Stack:** React + TypeScript, TanStack Query (via hooks das features de Alunos/Professores/Disciplinas), Lucide React.

## Global Constraints

(Herdadas do plano de Fundação — `docs/superpowers/plans/2026-07-13-fundacao.md`.)

- Sem endpoint dedicado de dashboard: os totais são `array.length` das 3 listagens (`GET /alunos`, `GET /professores`, `GET /disciplinas`), reaproveitando o cache do TanStack Query.
- Antes de criar qualquer componente novo, verificar `components/shared/` — esta página só usa componentes já existentes.
- Tipagem forte, sem `any`.
- Qualquer tarefa visual deve invocar a skill `frontend-design` antes de implementar.
- Sem suíte de testes automatizados — verificação manual via `npm run build` e navegador.
- Erros de API sempre no formato `{ "message": string }`.

## Pré-requisito

Este plano assume que os planos de Fundação, CRUD Alunos, CRUD Professores e CRUD Disciplinas já foram executados — `useAlunos`, `useProfessores` e `useDisciplinas` já existem em suas respectivas features, assim como a rota placeholder `/` em `src/App.tsx`.

---

### Task 1: Hook `useDashboardSummary`

**Files:**
- Create: `src/features/dashboard/useDashboardSummary.ts`

**Interfaces:**
- Consumes: `useAlunos` (`@/features/alunos/useAlunos`), `useProfessores` (`@/features/professores/useProfessores`), `useDisciplinas` (`@/features/disciplinas/useDisciplinas`)
- Produces: `useDashboardSummary(): { isLoading: boolean; isError: boolean; error: unknown; totals: { alunos: number; professores: number; disciplinas: number }; refetch: () => void }`. Usado por `DashboardPage` (Task 2).

- [ ] **Step 1: Criar `src/features/dashboard/useDashboardSummary.ts`**

```ts
import { useAlunos } from "@/features/alunos/useAlunos";
import { useProfessores } from "@/features/professores/useProfessores";
import { useDisciplinas } from "@/features/disciplinas/useDisciplinas";

export function useDashboardSummary() {
  const alunosQuery = useAlunos();
  const professoresQuery = useProfessores();
  const disciplinasQuery = useDisciplinas();

  const isLoading =
    alunosQuery.isLoading || professoresQuery.isLoading || disciplinasQuery.isLoading;
  const isError = alunosQuery.isError || professoresQuery.isError || disciplinasQuery.isError;
  const error = alunosQuery.error ?? professoresQuery.error ?? disciplinasQuery.error;

  return {
    isLoading,
    isError,
    error,
    totals: {
      alunos: alunosQuery.data?.length ?? 0,
      professores: professoresQuery.data?.length ?? 0,
      disciplinas: disciplinasQuery.data?.length ?? 0,
    },
    refetch: () => {
      alunosQuery.refetch();
      professoresQuery.refetch();
      disciplinasQuery.refetch();
    },
  };
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona useDashboardSummary agregando alunos, professores e disciplinas"
```

---

### Task 2: `DashboardPage`

**Antes de implementar:** invocar a skill `frontend-design` (tela de resumo com cards de métrica).

**Files:**
- Create: `src/features/dashboard/DashboardPage.tsx`

**Interfaces:**
- Consumes: `useDashboardSummary` (Task 1), `PageContainer`, `PageHeader`, `SectionCard`, `LoadingState`, `ErrorState` (`@/components/shared/*`), `getApiErrorMessage` (`@/api/client`), ícones `GraduationCap, Users, BookOpen` (`lucide-react`)
- Produces: `DashboardPage()` — default export usado em `src/App.tsx` (Task 3) na rota `/`.

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/dashboard/DashboardPage.tsx`**

```tsx
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getApiErrorMessage } from "@/api/client";
import { useDashboardSummary } from "./useDashboardSummary";

export default function DashboardPage() {
  const { isLoading, isError, error, totals, refetch } = useDashboardSummary();

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Resumo geral do sistema." />

      {isLoading ? <LoadingState label="Carregando resumo..." /> : null}

      {!isLoading && isError ? (
        <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionCard
            title="Total de Alunos"
            icon={<GraduationCap className="h-4 w-4 text-primary" />}
          >
            <p className="text-3xl font-semibold text-foreground">{totals.alunos}</p>
          </SectionCard>
          <SectionCard
            title="Total de Professores"
            icon={<Users className="h-4 w-4 text-primary" />}
          >
            <p className="text-3xl font-semibold text-foreground">{totals.professores}</p>
          </SectionCard>
          <SectionCard
            title="Total de Disciplinas"
            icon={<BookOpen className="h-4 w-4 text-primary" />}
          >
            <p className="text-3xl font-semibold text-foreground">{totals.disciplinas}</p>
          </SectionCard>
        </div>
      ) : null}
    </PageContainer>
  );
}
```

- [ ] **Step 3: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: adiciona DashboardPage com totais de alunos, professores e disciplinas"
```

---

### Task 3: Conectar `/` em `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `DashboardPage` (`@/features/dashboard/DashboardPage`, Task 2, default export)

- [ ] **Step 1: Adicionar o import de `DashboardPage` em `src/App.tsx`**

```tsx
import DashboardPage from "@/features/dashboard/DashboardPage";
```

- [ ] **Step 2: Substituir a rota `/`**

Trocar:

```tsx
<Route path="/" element={<PlaceholderPage title="Dashboard" />} />
```

por:

```tsx
<Route path="/" element={<DashboardPage />} />
```

Neste ponto, se todos os planos de CRUD já foram executados, a função local `PlaceholderPage` não é mais referenciada por nenhuma `<Route>` em `src/App.tsx` — remover sua definição do arquivo para não deixar código morto.

- [ ] **Step 3: Verificar com build**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Verificar manualmente com a API rodando**

Requer uma API real respondendo em `VITE_API_URL`, implementando `GET /alunos`, `GET /professores` e `GET /disciplinas`.

```bash
npm run dev
```

Abrir `http://localhost:5173/` e, com a API disponível, confirmar:
- Os 3 cards mostram os totais corretos (mesma contagem que aparece nas listagens de `/alunos`, `/professores` e `/disciplinas`).
- Cadastrar um novo aluno em `/alunos` e voltar para `/` atualiza o total de Alunos (o cache do TanStack Query é invalidado pela mutation e a Dashboard refaz a leitura).
- Derrubar a API (ou apontar `VITE_API_URL` para um endereço inválido) e recarregar `/` mostra o `ErrorState` agregado com botão de retry.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: conecta rota / a DashboardPage"
```

---

## Self-Review desta plan

- **Cobertura do spec**: 3 `SectionCard` (ícone Lucide + número + rótulo) ✅ (Task 2), sem filtros/tabela ✅, loading/erro agregados das 3 listagens ✅ (Tasks 1–2), sem endpoint dedicado — totais via `array.length` reaproveitando cache do TanStack Query ✅ (Task 1).
- **Placeholders**: nenhum.
- **Consistência de tipos**: `useDashboardSummary` (Task 1) consome exatamente as mesmas assinaturas de `useAlunos`/`useProfessores`/`useDisciplinas` já definidas nos planos de CRUD correspondentes (`UseQueryResult<T[]>` do TanStack Query).
