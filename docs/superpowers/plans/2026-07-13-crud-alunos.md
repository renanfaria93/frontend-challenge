# CRUD Alunos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a tela de Alunos com listagem, filtro (texto + status), paginação client-side, criação/edição via `FormModal` e exclusão via `ConfirmDialog`, consumindo exclusivamente a API real através de `createEntityHooks`.

**Architecture:** `features/alunos/` contém a página (`AlunosPage`), o schema de validação (`alunoSchema`, Zod), os campos do formulário (`AlunoFormFields`) e os hooks específicos (`useAlunos`, gerados por `createEntityHooks<Aluno, AlunoInput>`). A página filtra/pagina os dados client-side a partir da lista completa retornada por `useList`, e delega os estados de loading/erro/vazio para `LoadingState`/`ErrorState`/`EmptyState`.

**Tech Stack:** React + TypeScript, React Hook Form + Zod, TanStack Query (via `entityFactory` da Fundação), shadcn/ui (`select`, `form`, `label`).

## Global Constraints

(Herdadas do plano de Fundação — `docs/superpowers/plans/2026-07-13-fundacao.md` — e reforçadas aqui:)

- CRUD sempre via `createEntityHooks`; criar/editar sempre via `FormModal`; excluir sempre via `ConfirmDialog`. Nunca duplicar lógica de fetch nem criar página separada de criação/edição.
- Antes de criar qualquer componente novo, verificar `components/shared/`. shadcn/ui primeiro, sempre.
- Domínio em português nos campos/labels (`nome`, `matricula`, etc.); nomes técnicos em inglês.
- Toasts via `sonner` em toda mutation (já embutido em `createEntityHooks`); botões desabilitados durante submissão.
- Tipagem forte, sem `any`.
- Qualquer tarefa visual deve invocar a skill `frontend-design` antes de implementar, mesmo em ajustes pequenos.
- Sem suíte de testes automatizados — verificação manual via `npm run build` e navegador.
- Filtros e paginação são 100% client-side sobre a lista completa já carregada (sem busca/paginação no servidor).
- Erros de API sempre no formato `{ "message": string }`, exibidos via toast (mutations) ou `ErrorState` (falha de listagem).

## Pré-requisito

Este plano assume que o plano de Fundação (`docs/superpowers/plans/2026-07-13-fundacao.md`) já foi executado: `createEntityHooks`, tipos `Aluno`/`AlunoInput`, e os componentes `PageContainer`, `PageHeader`, `SectionCard`, `DataTable`, `SearchInput`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`, `ConfirmDialog`, `FormModal` já existem, assim como a rota placeholder `/alunos` em `src/App.tsx`.

---

### Task 1: Instalar componentes shadcn adicionais para formulários

**Files:**
- Create: `src/components/ui/select.tsx`, `src/components/ui/form.tsx`, `src/components/ui/label.tsx`

**Interfaces:**
- Produces: `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (`@/components/ui/select`); `Form, FormControl, FormField, FormItem, FormLabel, FormMessage` (`@/components/ui/form`, integra `react-hook-form` com estilos shadcn); `Label` (`@/components/ui/label`). Usados por `AlunoFormFields` (Task 4).

- [ ] **Step 1: Instalar os componentes**

```bash
npx shadcn@latest add select form label
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: adiciona componentes shadcn select, form e label"
```

---

### Task 2: Hook `useAlunos` (via `entityFactory`)

**Files:**
- Create: `src/features/alunos/useAlunos.ts`

**Interfaces:**
- Consumes: `createEntityHooks` (`@/api/entityFactory`), `Aluno`, `AlunoInput` (`@/types/aluno`)
- Produces: `useAlunos(): UseQueryResult<Aluno[]>`, `useCreateAluno(): UseMutationResult<Aluno, unknown, AlunoInput>`, `useUpdateAluno(): UseMutationResult<Aluno, unknown, { id: number; input: AlunoInput }>`, `useDeleteAluno(): UseMutationResult<void, unknown, number>`. Usados por `AlunosPage` (Task 5).

- [ ] **Step 1: Criar `src/features/alunos/useAlunos.ts`**

```ts
import { createEntityHooks } from "@/api/entityFactory";
import type { Aluno, AlunoInput } from "@/types/aluno";

const alunoHooks = createEntityHooks<Aluno, AlunoInput>("alunos", "Aluno");

export const useAlunos = alunoHooks.useList;
export const useCreateAluno = alunoHooks.useCreate;
export const useUpdateAluno = alunoHooks.useUpdate;
export const useDeleteAluno = alunoHooks.useDelete;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona hooks useAlunos via entityFactory"
```

---

### Task 3: Schema de validação `alunoSchema` (Zod)

**Files:**
- Create: `src/features/alunos/alunoSchema.ts`

**Interfaces:**
- Produces: `alunoSchema: ZodSchema<AlunoFormValues>` e `type AlunoFormValues = { nome: string; email: string; matricula: string; dataNascimento: string; status: "ativo" | "inativo" }`. `AlunoFormValues` é estruturalmente igual a `AlunoInput` (`@/types/aluno`) e é usado por `AlunoFormFields` (Task 4) e `AlunosPage` (Task 5) como o tipo do formulário `react-hook-form`.

- [ ] **Step 1: Criar `src/features/alunos/alunoSchema.ts`**

```ts
import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  matricula: z.string().trim().min(1, "Informe a matrícula."),
  dataNascimento: z.string().trim().min(1, "Informe a data de nascimento."),
  status: z.enum(["ativo", "inativo"]),
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona schema de validacao alunoSchema"
```

---

### Task 4: Campos do formulário — `AlunoFormFields`

**Antes de implementar:** invocar a skill `frontend-design` (formulário de entidade).

**Files:**
- Create: `src/features/alunos/AlunoFormFields.tsx`

**Interfaces:**
- Consumes: `Form, FormControl, FormField, FormItem, FormLabel, FormMessage` (`@/components/ui/form`, Task 1), `Input` (`@/components/ui/input`), `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (`@/components/ui/select`, Task 1), `UseFormReturn<AlunoFormValues>` (`react-hook-form`), `AlunoFormValues` (`@/features/alunos/alunoSchema`, Task 3)
- Produces: `AlunoFormFields({ form }: { form: UseFormReturn<AlunoFormValues> })` — renderiza os campos `nome`, `email`, `matricula`, `dataNascimento`, `status`. Usado dentro do `FormModal` em `AlunosPage` (Task 5).

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/alunos/AlunoFormFields.tsx`**

```tsx
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AlunoFormValues } from "./alunoSchema";

interface AlunoFormFieldsProps {
  form: UseFormReturn<AlunoFormValues>;
}

export function AlunoFormFields({ form }: AlunoFormFieldsProps) {
  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input placeholder="2026001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
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
git commit -m "feat: adiciona AlunoFormFields"
```

---

### Task 5: `AlunosPage` — listagem, filtro e paginação

**Antes de implementar:** invocar a skill `frontend-design` (tela completa de listagem).

**Files:**
- Create: `src/features/alunos/AlunosPage.tsx`

**Interfaces:**
- Consumes: `useAlunos` (Task 2), `PageContainer`, `PageHeader`, `SectionCard`, `DataTable`, `DataTableColumn`, `SearchInput`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState` (`@/components/shared/*`, Fundação), `Button` (`@/components/ui/button`), `Select*` (`@/components/ui/select`, Task 1), `Aluno` (`@/types/aluno`)
- Produces: `AlunosPage()` — componente de página completo, default export usado em `src/App.tsx` (Task 8) na rota `/alunos`.

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/alunos/AlunosPage.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/api/client";
import type { Aluno } from "@/types/aluno";
import { useAlunos } from "./useAlunos";
import { AlunoFormModal } from "./AlunoFormModal";
import { AlunoDeleteDialog } from "./AlunoDeleteDialog";

type StatusFilter = "todos" | "ativo" | "inativo";

export default function AlunosPage() {
  const { data: alunos, isLoading, isError, error, refetch } = useAlunos();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [formState, setFormState] = useState<{ open: boolean; aluno: Aluno | null }>({
    open: false,
    aluno: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Aluno | null>(null);

  const filteredAlunos = useMemo(() => {
    if (!alunos) return [];
    const term = search.trim().toLowerCase();
    return alunos.filter((aluno) => {
      const matchesSearch =
        term.length === 0 ||
        aluno.nome.toLowerCase().includes(term) ||
        aluno.email.toLowerCase().includes(term) ||
        aluno.matricula.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "todos" || aluno.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [alunos, search, statusFilter]);

  const columns: DataTableColumn<Aluno>[] = [
    { key: "nome", header: "Nome", render: (aluno) => aluno.nome },
    { key: "email", header: "Email", render: (aluno) => aluno.email },
    { key: "matricula", header: "Matrícula", render: (aluno) => aluno.matricula },
    {
      key: "status",
      header: "Status",
      render: (aluno) => <StatusBadge status={aluno.status} />,
    },
    {
      key: "acoes",
      header: "Ações",
      className: "text-right",
      render: (aluno) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${aluno.nome}`}
            onClick={() => setFormState({ open: true, aluno })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${aluno.nome}`}
            onClick={() => setDeleteTarget(aluno)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos matriculados."
        action={
          <Button onClick={() => setFormState({ open: true, aluno: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Novo aluno
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, email ou matrícula..."
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingState label="Carregando alunos..." /> : null}

        {isError ? (
          <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
        ) : null}

        {!isLoading && !isError && filteredAlunos.length === 0 ? (
          <EmptyState
            title={
              alunos && alunos.length > 0
                ? "Nenhum aluno encontrado para os filtros atuais."
                : "Nenhum aluno cadastrado ainda."
            }
            description={
              alunos && alunos.length > 0
                ? "Ajuste a busca ou o filtro de status."
                : "Comece cadastrando o primeiro aluno."
            }
            actionLabel={alunos && alunos.length > 0 ? undefined : "Novo aluno"}
            onAction={
              alunos && alunos.length > 0
                ? undefined
                : () => setFormState({ open: true, aluno: null })
            }
          />
        ) : null}

        {!isLoading && !isError && filteredAlunos.length > 0 ? (
          <DataTable
            key={`${search}-${statusFilter}`}
            data={filteredAlunos}
            columns={columns}
            getRowId={(aluno) => aluno.id}
          />
        ) : null}
      </SectionCard>

      <AlunoFormModal
        open={formState.open}
        aluno={formState.aluno}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <AlunoDeleteDialog aluno={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </PageContainer>
  );
}
```

Este componente referencia `AlunoFormModal` e `AlunoDeleteDialog`, criados nas Tasks 6 e 7 a seguir (mantidos em arquivos separados para isolar a lógica de `react-hook-form`/mutation da lógica de listagem/filtro).

- [ ] **Step 3: Verificar**

```bash
npm run build
```

Esperado: **falha** nesta etapa (`AlunoFormModal` e `AlunoDeleteDialog` ainda não existem) — isso é esperado neste ponto do plano; a verificação completa acontece ao final da Task 7. Não commitar ainda.

---

### Task 6: `AlunoFormModal` — criação/edição via `FormModal`

**Files:**
- Create: `src/features/alunos/AlunoFormModal.tsx`

**Interfaces:**
- Consumes: `FormModal` (`@/components/shared/FormModal`, Fundação), `AlunoFormFields` (Task 4), `alunoSchema`, `AlunoFormValues` (Task 3), `useCreateAluno`, `useUpdateAluno` (Task 2), `Aluno` (`@/types/aluno`), `zodResolver` (`@hookform/resolvers/zod`), `useForm` (`react-hook-form`)
- Produces: `AlunoFormModal({ open, aluno, onOpenChange }: { open: boolean; aluno: Aluno | null; onOpenChange: (open: boolean) => void })`. Quando `aluno` é `null`, opera em modo criação; quando não-nulo, em modo edição (formulário pré-preenchido). Consumido por `AlunosPage` (Task 5).

- [ ] **Step 1: Criar `src/features/alunos/AlunoFormModal.tsx`**

```tsx
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import type { Aluno } from "@/types/aluno";
import { alunoSchema, type AlunoFormValues } from "./alunoSchema";
import { AlunoFormFields } from "./AlunoFormFields";
import { useCreateAluno, useUpdateAluno } from "./useAlunos";

interface AlunoFormModalProps {
  open: boolean;
  aluno: Aluno | null;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: AlunoFormValues = {
  nome: "",
  email: "",
  matricula: "",
  dataNascimento: "",
  status: "ativo",
};

export function AlunoFormModal({ open, aluno, onOpenChange }: AlunoFormModalProps) {
  const isEditing = aluno !== null;
  const createAluno = useCreateAluno();
  const updateAluno = useUpdateAluno();
  const isSubmitting = createAluno.isPending || updateAluno.isPending;

  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      aluno
        ? {
            nome: aluno.nome,
            email: aluno.email,
            matricula: aluno.matricula,
            dataNascimento: aluno.dataNascimento,
            status: aluno.status,
          }
        : EMPTY_VALUES,
    );
  }, [open, aluno, form]);

  function handleValid(values: AlunoFormValues) {
    if (isEditing) {
      updateAluno.mutate(
        { id: aluno.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createAluno.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar aluno" : "Novo aluno"}
      description={
        isEditing ? "Atualize os dados do aluno." : "Preencha os dados do novo aluno."
      }
      onSubmit={form.handleSubmit(handleValid)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Criar aluno"}
    >
      <AlunoFormFields form={form} />
    </FormModal>
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: **ainda falha** (`AlunoDeleteDialog` da Task 7 falta) — esperado neste ponto. Não commitar ainda.

---

### Task 7: `AlunoDeleteDialog` — exclusão via `ConfirmDialog`

**Files:**
- Create: `src/features/alunos/AlunoDeleteDialog.tsx`

**Interfaces:**
- Consumes: `ConfirmDialog` (`@/components/shared/ConfirmDialog`, Fundação), `useDeleteAluno` (Task 2), `Aluno` (`@/types/aluno`)
- Produces: `AlunoDeleteDialog({ aluno, onOpenChange }: { aluno: Aluno | null; onOpenChange: (open: boolean) => void })`. O diálogo fica visível (`open={aluno !== null}`) sempre que `aluno` não é `null`. Consumido por `AlunosPage` (Task 5).

- [ ] **Step 1: Criar `src/features/alunos/AlunoDeleteDialog.tsx`**

```tsx
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Aluno } from "@/types/aluno";
import { useDeleteAluno } from "./useAlunos";

interface AlunoDeleteDialogProps {
  aluno: Aluno | null;
  onOpenChange: (open: boolean) => void;
}

export function AlunoDeleteDialog({ aluno, onOpenChange }: AlunoDeleteDialogProps) {
  const deleteAluno = useDeleteAluno();

  return (
    <ConfirmDialog
      open={aluno !== null}
      onOpenChange={onOpenChange}
      title="Excluir aluno"
      description={
        aluno
          ? `Tem certeza que deseja excluir "${aluno.nome}"? Esta ação não pode ser desfeita.`
          : ""
      }
      isConfirming={deleteAluno.isPending}
      onConfirm={() => {
        if (!aluno) return;
        deleteAluno.mutate(aluno.id, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros (agora que `AlunosPage`, `AlunoFormModal` e `AlunoDeleteDialog` existem, todos os imports resolvem).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona AlunosPage com formulario e exclusao de alunos"
```

---

### Task 8: Conectar `/alunos` em `App.tsx`

**Files:**
- Modify: `src/App.tsx:1-19` (arquivo criado na Task 15 do plano de Fundação)

**Interfaces:**
- Consumes: `AlunosPage` (`@/features/alunos/AlunosPage`, Task 5, default export)

- [ ] **Step 1: Adicionar o import de `AlunosPage` em `src/App.tsx`**

No topo do arquivo, junto aos demais imports:

```tsx
import AlunosPage from "@/features/alunos/AlunosPage";
```

- [ ] **Step 2: Substituir a rota `/alunos`**

Trocar:

```tsx
<Route path="/alunos" element={<PlaceholderPage title="Alunos" />} />
```

por:

```tsx
<Route path="/alunos" element={<AlunosPage />} />
```

- [ ] **Step 3: Verificar com build**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Verificar manualmente com a API rodando**

Este passo requer uma API real respondendo em `VITE_API_URL` (ex.: `http://localhost:3000`), implementando ao menos `GET/POST/PUT/DELETE /alunos` conforme `api-contract/openapi.yaml`. Sem uma API no ar, a tela mostrará o `ErrorState` — o que também é um resultado válido para confirmar que a chamada de API real está sendo feita (nenhum dado mockado aparece).

```bash
npm run dev
```

Abrir `http://localhost:5173/alunos` e, se a API estiver disponível, confirmar:
- Lista de alunos carregada da API aparece na tabela.
- Buscar por nome/email/matrícula filtra a tabela; filtrar por status também.
- "Novo aluno" abre o `FormModal`; submeter cria o aluno via `POST /alunos`, fecha o modal e mostra toast de sucesso; a lista atualiza sem reload.
- Clicar em editar (ícone lápis) abre o modal pré-preenchido; salvar atualiza via `PUT /alunos/:id`.
- Clicar em excluir (ícone lixeira) abre o `ConfirmDialog`; confirmar remove via `DELETE /alunos/:id`.
- Com a lista vazia (nenhum aluno cadastrado), aparece o `EmptyState` com CTA "Novo aluno" — nunca dado inventado.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: conecta rota /alunos a AlunosPage"
```

---

## Self-Review desta plan

- **Cobertura do spec**: colunas nome/email/matrícula/status/ações ✅ (Task 5), filtro texto+status ✅ (Task 5), form nome/email/matrícula/data de nascimento/status ✅ (Task 4), criar/editar via `FormModal` ✅ (Task 6), excluir via `ConfirmDialog` ✅ (Task 7), paginação client-side ~10 itens (herdada do `DataTable` genérico da Fundação) ✅, loading/erro/vazio ✅ (Task 5).
- **Placeholders**: nenhum. As Tasks 5–6 declaram explicitamente que o build falha até a Task 7 completar — isso é uma sequência intencional de dependência circular de arquivos (página → modal → dialog, todos se referenciando), não um placeholder.
- **Consistência de tipos**: `AlunoFormValues` (Task 3) é estruturalmente idêntico a `AlunoInput` (`@/types/aluno`, Fundação), então `createAluno.mutate(values)` e `updateAluno.mutate({ id, input: values })` (Task 6) tipam corretamente contra `useCreateAluno`/`useUpdateAluno` (Task 2). `DataTableColumn<Aluno>` (Task 5) usa a mesma assinatura genérica definida em `@/components/shared/DataTable` (Fundação).
