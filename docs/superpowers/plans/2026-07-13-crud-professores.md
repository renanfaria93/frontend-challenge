# CRUD Professores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a tela de Professores com listagem, filtro (texto + status), paginação client-side, criação/edição via `FormModal` e exclusão via `ConfirmDialog`, seguindo exatamente o mesmo padrão do CRUD de Alunos.

**Architecture:** `features/professores/` contém a página (`ProfessoresPage`), o schema de validação (`professorSchema`, Zod), os campos do formulário (`ProfessorFormFields`) e os hooks específicos (`useProfessores`, gerados por `createEntityHooks<Professor, ProfessorInput>`). Estrutura de arquivos e responsabilidades são idênticas ao plano de CRUD Alunos, trocando os campos específicos (`especialidade` no lugar de `matricula`/`dataNascimento`).

**Tech Stack:** React + TypeScript, React Hook Form + Zod, TanStack Query (via `entityFactory` da Fundação), shadcn/ui (`select`, `form`, `label` — já instalados pelo plano de CRUD Alunos).

## Global Constraints

(Herdadas do plano de Fundação — `docs/superpowers/plans/2026-07-13-fundacao.md`.)

- CRUD sempre via `createEntityHooks`; criar/editar sempre via `FormModal`; excluir sempre via `ConfirmDialog`. Nunca duplicar lógica de fetch nem criar página separada de criação/edição.
- Antes de criar qualquer componente novo, verificar `components/shared/`. shadcn/ui primeiro, sempre.
- Domínio em português nos campos/labels (`nome`, `especialidade`, etc.); nomes técnicos em inglês.
- Toasts via `sonner` em toda mutation (já embutido em `createEntityHooks`); botões desabilitados durante submissão.
- Tipagem forte, sem `any`.
- Qualquer tarefa visual deve invocar a skill `frontend-design` antes de implementar, mesmo em ajustes pequenos.
- Sem suíte de testes automatizados — verificação manual via `npm run build` e navegador.
- Filtros e paginação são 100% client-side sobre a lista completa já carregada (sem busca/paginação no servidor).
- Erros de API sempre no formato `{ "message": string }`, exibidos via toast (mutations) ou `ErrorState` (falha de listagem).

## Pré-requisito

Este plano assume que o plano de Fundação já foi executado (tipos, `createEntityHooks`, componentes shared, rota placeholder `/professores` em `src/App.tsx`) e que o plano de CRUD Alunos já instalou os componentes shadcn `select`, `form` e `label` (se este plano for executado antes do de Alunos, repetir a Task 1 abaixo).

---

### Task 1: Garantir componentes shadcn de formulário instalados

**Files:**

- Create (se ainda não existirem): `src/components/ui/select.tsx`, `src/components/ui/form.tsx`, `src/components/ui/label.tsx`

**Interfaces:**

- Produces: `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (`@/components/ui/select`); `Form, FormControl, FormField, FormItem, FormLabel, FormMessage` (`@/components/ui/form`); `Label` (`@/components/ui/label`). Usados por `ProfessorFormFields` (Task 4).

- [ ] **Step 1: Verificar se já existem (instalados pelo plano de CRUD Alunos)**

```bash
ls src/components/ui/select.tsx src/components/ui/form.tsx src/components/ui/label.tsx
```

Se os três arquivos existirem, pular para o Step 3 (nada a commitar nesta task).

- [ ] **Step 2: Instalar os componentes, se faltantes**

```bash
npx shadcn@latest add select form label
```

- [ ] **Step 3: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Commit (somente se o Step 2 foi executado)**

```bash
git add -A
git commit -m "chore: adiciona componentes shadcn select, form e label"
```

---

### Task 2: Hook `useProfessores` (via `entityFactory`)

**Files:**

- Create: `src/features/professores/useProfessores.ts`

**Interfaces:**

- Consumes: `createEntityHooks` (`@/api/entityFactory`), `Professor`, `ProfessorInput` (`@/types/professor`)
- Produces: `useProfessores(): UseQueryResult<Professor[]>`, `useCreateProfessor(): UseMutationResult<Professor, unknown, ProfessorInput>`, `useUpdateProfessor(): UseMutationResult<Professor, unknown, { id: number; input: ProfessorInput }>`, `useDeleteProfessor(): UseMutationResult<void, unknown, number>`. Usados por `ProfessoresPage` (Task 5) e, no plano de CRUD Disciplinas, por `useProfessores` para alimentar o select de professor.

- [ ] **Step 1: Criar `src/features/professores/useProfessores.ts`**

```ts
import { createEntityHooks } from "@/api/entityFactory";
import type { Professor, ProfessorInput } from "@/types/professor";

const professorHooks = createEntityHooks<Professor, ProfessorInput>("professores", "Professor");

export const useProfessores = professorHooks.useList;
export const useCreateProfessor = professorHooks.useCreate;
export const useUpdateProfessor = professorHooks.useUpdate;
export const useDeleteProfessor = professorHooks.useDelete;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona hooks useProfessores via entityFactory"
```

---

### Task 3: Schema de validação `professorSchema` (Zod)

**Files:**

- Create: `src/features/professores/professorSchema.ts`

**Interfaces:**

- Produces: `professorSchema: ZodSchema<ProfessorFormValues>` e `type ProfessorFormValues = { nome: string; email: string; especialidade: string; status: "ativo" | "inativo" }`. `ProfessorFormValues` é estruturalmente igual a `ProfessorInput` (`@/types/professor`) e é usado por `ProfessorFormFields` (Task 4) e `ProfessoresPage` (Task 5).

- [ ] **Step 1: Criar `src/features/professores/professorSchema.ts`**

```ts
import { z } from "zod";

export const professorSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  especialidade: z.string().trim().min(1, "Informe a especialidade."),
  status: z.enum(["ativo", "inativo"]),
});

export type ProfessorFormValues = z.infer<typeof professorSchema>;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona schema de validacao professorSchema"
```

---

### Task 4: Campos do formulário — `ProfessorFormFields`

**Antes de implementar:** invocar a skill `frontend-design` (formulário de entidade).

**Files:**

- Create: `src/features/professores/ProfessorFormFields.tsx`

**Interfaces:**

- Consumes: `Form, FormControl, FormField, FormItem, FormLabel, FormMessage` (`@/components/ui/form`), `Input` (`@/components/ui/input`), `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (`@/components/ui/select`), `UseFormReturn<ProfessorFormValues>` (`react-hook-form`), `ProfessorFormValues` (`@/features/professores/professorSchema`, Task 3)
- Produces: `ProfessorFormFields({ form }: { form: UseFormReturn<ProfessorFormValues> })` — renderiza os campos `nome`, `email`, `especialidade`, `status`. Usado dentro do `FormModal` em `ProfessoresPage` (Task 5).

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/professores/ProfessorFormFields.tsx`**

```tsx
import type { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfessorFormValues } from "./professorSchema";

interface ProfessorFormFieldsProps {
  form: UseFormReturn<ProfessorFormValues>;
}

export function ProfessorFormFields({ form }: ProfessorFormFieldsProps) {
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
          name="especialidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl>
                <Input placeholder="Matemática" {...field} />
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
git commit -m "feat: adiciona ProfessorFormFields"
```

---

### Task 5: `ProfessoresPage` — listagem, filtro e paginação

**Antes de implementar:** invocar a skill `frontend-design` (tela completa de listagem).

**Files:**

- Create: `src/features/professores/ProfessoresPage.tsx`

**Interfaces:**

- Consumes: `useProfessores` (Task 2), `PageContainer`, `PageHeader`, `SectionCard`, `DataTable`, `DataTableColumn`, `SearchInput`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState` (`@/components/shared/*`, Fundação), `Button` (`@/components/ui/button`), `Select*` (`@/components/ui/select`), `Professor` (`@/types/professor`)
- Produces: `ProfessoresPage()` — componente de página completo, default export usado em `src/App.tsx` (Task 7) na rota `/professores`.

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/professores/ProfessoresPage.tsx`**

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiErrorMessage } from "@/api/client";
import type { Professor } from "@/types/professor";
import { useProfessores } from "./useProfessores";
import { ProfessorFormModal } from "./ProfessorFormModal";
import { ProfessorDeleteDialog } from "./ProfessorDeleteDialog";

type StatusFilter = "todos" | "ativo" | "inativo";

export default function ProfessoresPage() {
  const { data: professores, isLoading, isError, error, refetch } = useProfessores();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [formState, setFormState] = useState<{ open: boolean; professor: Professor | null }>({
    open: false,
    professor: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Professor | null>(null);

  const filteredProfessores = useMemo(() => {
    if (!professores) return [];
    const term = search.trim().toLowerCase();
    return professores.filter((professor) => {
      const matchesSearch = term.length === 0 || professor.nome.toLowerCase().includes(term) || professor.email.toLowerCase().includes(term) || professor.especialidade.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "todos" || professor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [professores, search, statusFilter]);

  const columns: DataTableColumn<Professor>[] = [
    { key: "nome", header: "Nome", render: (professor) => professor.nome },
    { key: "email", header: "Email", render: (professor) => professor.email },
    {
      key: "especialidade",
      header: "Especialidade",
      render: (professor) => professor.especialidade,
    },
    {
      key: "status",
      header: "Status",
      render: (professor) => <StatusBadge status={professor.status} />,
    },
    {
      key: "acoes",
      header: "Ações",
      className: "text-right",
      render: (professor) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label={`Editar ${professor.nome}`} onClick={() => setFormState({ open: true, professor })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Excluir ${professor.nome}`} onClick={() => setDeleteTarget(professor)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Professores"
        description="Gerencie os professores cadastrados."
        action={
          <Button onClick={() => setFormState({ open: true, professor: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Novo professor
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, email ou especialidade..." />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
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

        {isLoading ? <LoadingState label="Carregando professores..." /> : null}

        {isError ? <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} /> : null}

        {!isLoading && !isError && filteredProfessores.length === 0 ? (
          <EmptyState
            title={professores && professores.length > 0 ? "Nenhum professor encontrado para os filtros atuais." : "Nenhum professor cadastrado ainda."}
            description={professores && professores.length > 0 ? "Ajuste a busca ou o filtro de status." : "Comece cadastrando o primeiro professor."}
            actionLabel={professores && professores.length > 0 ? undefined : "Novo professor"}
            onAction={professores && professores.length > 0 ? undefined : () => setFormState({ open: true, professor: null })}
          />
        ) : null}

        {!isLoading && !isError && filteredProfessores.length > 0 ? (
          <DataTable key={`${search}-${statusFilter}`} data={filteredProfessores} columns={columns} getRowId={(professor) => professor.id} />
        ) : null}
      </SectionCard>

      <ProfessorFormModal open={formState.open} professor={formState.professor} onOpenChange={(open) => setFormState((current) => ({ ...current, open }))} />

      <ProfessorDeleteDialog professor={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </PageContainer>
  );
}
```

- [ ] **Step 3: Verificar**

```bash
npm run build
```

Esperado: **falha** nesta etapa (`ProfessorFormModal` e `ProfessorDeleteDialog` ainda não existem) — esperado neste ponto do plano; a verificação completa acontece ao final da Task 7 (a próxima é a Task 6 abaixo, seguida da Task 7 de exclusão). Não commitar ainda.

---

### Task 6: `ProfessorFormModal` — criação/edição via `FormModal`

**Files:**

- Create: `src/features/professores/ProfessorFormModal.tsx`

**Interfaces:**

- Consumes: `FormModal` (`@/components/shared/FormModal`, Fundação), `ProfessorFormFields` (Task 4), `professorSchema`, `ProfessorFormValues` (Task 3), `useCreateProfessor`, `useUpdateProfessor` (Task 2), `Professor` (`@/types/professor`), `zodResolver` (`@hookform/resolvers/zod`), `useForm` (`react-hook-form`)
- Produces: `ProfessorFormModal({ open, professor, onOpenChange }: { open: boolean; professor: Professor | null; onOpenChange: (open: boolean) => void })`. Consumido por `ProfessoresPage` (Task 5).

- [ ] **Step 1: Criar `src/features/professores/ProfessorFormModal.tsx`**

```tsx
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import type { Professor } from "@/types/professor";
import { professorSchema, type ProfessorFormValues } from "./professorSchema";
import { ProfessorFormFields } from "./ProfessorFormFields";
import { useCreateProfessor, useUpdateProfessor } from "./useProfessores";

interface ProfessorFormModalProps {
  open: boolean;
  professor: Professor | null;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: ProfessorFormValues = {
  nome: "",
  email: "",
  especialidade: "",
  status: "ativo",
};

export function ProfessorFormModal({ open, professor, onOpenChange }: ProfessorFormModalProps) {
  const isEditing = professor !== null;
  const createProfessor = useCreateProfessor();
  const updateProfessor = useUpdateProfessor();
  const isSubmitting = createProfessor.isPending || updateProfessor.isPending;

  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      professor
        ? {
            nome: professor.nome,
            email: professor.email,
            especialidade: professor.especialidade,
            status: professor.status,
          }
        : EMPTY_VALUES,
    );
  }, [open, professor, form]);

  function handleValid(values: ProfessorFormValues) {
    if (isEditing) {
      updateProfessor.mutate({ id: professor.id, input: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createProfessor.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar professor" : "Novo professor"}
      description={isEditing ? "Atualize os dados do professor." : "Preencha os dados do novo professor."}
      onSubmit={form.handleSubmit(handleValid)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Criar professor"}
    >
      <ProfessorFormFields form={form} />
    </FormModal>
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: **ainda falha** (`ProfessorDeleteDialog` da Task 7 falta) — esperado neste ponto. Não commitar ainda.

---

### Task 7: `ProfessorDeleteDialog` — exclusão via `ConfirmDialog`

**Files:**

- Create: `src/features/professores/ProfessorDeleteDialog.tsx`

**Interfaces:**

- Consumes: `ConfirmDialog` (`@/components/shared/ConfirmDialog`, Fundação), `useDeleteProfessor` (Task 2), `Professor` (`@/types/professor`)
- Produces: `ProfessorDeleteDialog({ professor, onOpenChange }: { professor: Professor | null; onOpenChange: (open: boolean) => void })`. Consumido por `ProfessoresPage` (Task 5).

- [ ] **Step 1: Criar `src/features/professores/ProfessorDeleteDialog.tsx`**

```tsx
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Professor } from "@/types/professor";
import { useDeleteProfessor } from "./useProfessores";

interface ProfessorDeleteDialogProps {
  professor: Professor | null;
  onOpenChange: (open: boolean) => void;
}

export function ProfessorDeleteDialog({ professor, onOpenChange }: ProfessorDeleteDialogProps) {
  const deleteProfessor = useDeleteProfessor();

  return (
    <ConfirmDialog
      open={professor !== null}
      onOpenChange={onOpenChange}
      title="Excluir professor"
      description={
        professor ? `Tem certeza que deseja excluir "${professor.nome}"? Esta ação não pode ser desfeita. Se este professor estiver vinculado a alguma disciplina, a API pode recusar a exclusão.` : ""
      }
      isConfirming={deleteProfessor.isPending}
      onConfirm={() => {
        if (!professor) return;
        deleteProfessor.mutate(professor.id, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros (agora que `ProfessoresPage`, `ProfessorFormModal` e `ProfessorDeleteDialog` existem, todos os imports resolvem).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona ProfessoresPage com formulario e exclusao de professores"
```

---

### Task 8: Conectar `/professores` em `App.tsx`

**Files:**

- Modify: `src/App.tsx`

**Interfaces:**

- Consumes: `ProfessoresPage` (`@/features/professores/ProfessoresPage`, Task 5, default export)

- [ ] **Step 1: Adicionar o import de `ProfessoresPage` em `src/App.tsx`**

No topo do arquivo, junto aos demais imports:

```tsx
import ProfessoresPage from "@/features/professores/ProfessoresPage";
```

- [ ] **Step 2: Substituir a rota `/professores`**

Trocar:

```tsx
<Route path="/professores" element={<PlaceholderPage title="Professores" />} />
```

por:

```tsx
<Route path="/professores" element={<ProfessoresPage />} />
```

- [ ] **Step 3: Verificar com build**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Verificar manualmente com a API rodando**

Requer uma API real respondendo em `VITE_API_URL`, implementando `GET/POST/PUT/DELETE /professores` conforme `contract/openapi.yaml`. Sem API no ar, a tela mostra `ErrorState` (comportamento válido — confirma ausência de dado mockado).

```bash
npm run dev
```

Abrir `http://localhost:5173/professores` e, com a API disponível, confirmar:

- Lista de professores da API aparece na tabela.
- Busca por nome/email/especialidade filtra a tabela; filtro de status também.
- "Novo professor" cria via `POST /professores` com toast de sucesso e atualização da lista.
- Editar abre modal pré-preenchido e salva via `PUT /professores/:id`.
- Excluir abre `ConfirmDialog` e remove via `DELETE /professores/:id`; se a API retornar 409 (professor vinculado a disciplina), o toast de erro exibe a `message` retornada.
- Lista vazia mostra `EmptyState` com CTA "Novo professor".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: conecta rota /professores a ProfessoresPage"
```

---

## Self-Review desta plan

- **Cobertura do spec**: colunas nome/email/especialidade/status/ações ✅ (Task 5), filtro texto+status ✅ (Task 5), form nome/email/especialidade/status ✅ (Task 4), criar/editar via `FormModal` ✅ (Task 6), excluir via `ConfirmDialog` ✅ (Task 7, incluindo nota sobre possível 409 por vínculo com disciplina), paginação client-side (herdada do `DataTable`) ✅, loading/erro/vazio ✅ (Task 5).
- **Placeholders**: nenhum. Sequência Task 5→6→7 com build intencionalmente quebrado documentado, igual ao plano de CRUD Alunos.
- **Consistência de tipos**: `ProfessorFormValues` (Task 3) espelha `ProfessorInput` (`@/types/professor`, Fundação); `useCreateProfessor`/`useUpdateProfessor` (Task 2) usam a mesma assinatura de `createEntityHooks` definida na Fundação e já usada em `useAlunos` do plano de CRUD Alunos.
