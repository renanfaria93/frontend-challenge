# CRUD Disciplinas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a tela de Disciplinas com listagem (nome, carga horária, professor responsável resolvido via cache, nº de alunos matriculados), filtro (texto + professor), criação/edição via `FormModal` com select único de professor e multi-select de alunos, e exclusão via `ConfirmDialog`.

**Architecture:** `features/disciplinas/` segue o mesmo padrão dos CRUDs de Alunos e Professores, com duas diferenças: (1) o formulário precisa dos dados de `useProfessores()` e `useAlunos()` para popular os selects — como essas queries usam as mesmas `queryKey` (`["professores"]`, `["alunos"]`) já usadas pelas páginas de Professores/Alunos, o TanStack Query reaproveita o cache automaticamente, sem esforço extra; (2) a listagem resolve o nome do professor e a contagem de alunos localmente, a partir dessas mesmas listas, em vez de esperar objetos aninhados da API.

**Tech Stack:** React + TypeScript, React Hook Form + Zod, TanStack Query, shadcn/ui (`select`, `form`, `label`, `popover`, `command`).

## Global Constraints

(Herdadas do plano de Fundação — `docs/superpowers/plans/2026-07-13-fundacao.md`.)

- CRUD sempre via `createEntityHooks`; criar/editar sempre via `FormModal`; excluir sempre via `ConfirmDialog`.
- Antes de criar qualquer componente novo, verificar `components/shared/`. shadcn/ui primeiro, sempre — inclusive para o multi-select (ver Task 2).
- Domínio em português nos campos/labels (`nome`, `cargaHoraria`, `professorId`, `alunosIds`); nomes técnicos em inglês.
- Toasts via `sonner` em toda mutation; botões desabilitados durante submissão.
- Tipagem forte, sem `any`.
- Qualquer tarefa visual deve invocar a skill `frontend-design` antes de implementar, mesmo em ajustes pequenos.
- Sem suíte de testes automatizados — verificação manual via `npm run build` e navegador.
- Filtros e paginação são 100% client-side sobre a lista completa já carregada.
- Disciplina guarda apenas `professorId` e `alunosIds` — sem objetos aninhados no GET; nome do professor e contagem de alunos são resolvidos no frontend a partir do cache de `/professores` e `/alunos`.
- Erros de API sempre no formato `{ "message": string }`.

## Pré-requisito

Este plano assume que o plano de Fundação já foi executado (tipos, `createEntityHooks`, componentes shared, rota placeholder `/disciplinas`) e que os planos de CRUD Alunos e Professores já existem — `useAlunos`/`useCreateAluno`/etc. (`@/features/alunos/useAlunos`) e `useProfessores`/`useCreateProfessor`/etc. (`@/features/professores/useProfessores`) são consumidos diretamente aqui.

---

### Task 1: Garantir componentes shadcn de formulário instalados

**Files:**
- Create (se ainda não existirem): `src/components/ui/select.tsx`, `src/components/ui/form.tsx`, `src/components/ui/label.tsx`

**Interfaces:**
- Produces: `Select*` (`@/components/ui/select`), `Form*` (`@/components/ui/form`), `Label` (`@/components/ui/label`). Usados por `DisciplinaFormFields` (Task 5).

- [ ] **Step 1: Verificar se já existem**

```bash
ls src/components/ui/select.tsx src/components/ui/form.tsx src/components/ui/label.tsx
```

Se os três arquivos existirem (instalados pelos planos de CRUD Alunos/Professores), pular para o Step 3.

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

### Task 2: Multi-select de alunos (`MultiSelect`)

**Antes de implementar:** invocar a skill `frontend-design` (componente de UI).

**Files:**
- Create: `src/components/ui/multi-select.tsx`

**Interfaces:**
- Consumes: `Popover, PopoverContent, PopoverTrigger` (`@/components/ui/popover`), `Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList` (`@/components/ui/command`), `Badge` (`@/components/ui/badge`), `Button` (`@/components/ui/button`), `cn` (`@/lib/utils`)
- Produces: `interface MultiSelectOption { value: number; label: string }` e `MultiSelect({ options, selected, onChange, placeholder }: { options: MultiSelectOption[]; selected: number[]; onChange: (selected: number[]) => void; placeholder?: string })`. Usado pelo campo `alunosIds` em `DisciplinaFormFields` (Task 5).

- [ ] **Step 1: Verificar o registry oficial do shadcn/ui**

```bash
npx shadcn@latest search multi-select
```

Até a data deste plano, o registry oficial do shadcn/ui (`https://ui.shadcn.com/r`) **não** expõe um componente `multi-select` consolidado — apenas os primitivos `select` (seleção única), `popover` e `command`. Se o comando acima listar um componente oficial disponível no registry padrão, instalá-lo com `npx shadcn@latest add <nome>` no lugar deste Step e ajustar a Task 5 para usar a API dele; caso contrário (comportamento esperado hoje), seguir para o Step 2 e construir o fallback documentado no spec (Popover + Command + Badge).

- [ ] **Step 2: Instalar os primitivos do fallback**

```bash
npx shadcn@latest add popover command
```

- [ ] **Step 3: Invocar a skill `frontend-design`**

- [ ] **Step 4: Criar `src/components/ui/multi-select.tsx`**

```tsx
import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: number;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggle(value: number) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  function remove(value: number) {
    onChange(selected.filter((item) => item !== value));
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-9 w-full justify-between font-normal"
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(option.value);
                  }}
                >
                  {option.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggle(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 5: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: adiciona MultiSelect (popover + command + badge)"
```

---

### Task 3: Hook `useDisciplinas` (via `entityFactory`)

**Files:**
- Create: `src/features/disciplinas/useDisciplinas.ts`

**Interfaces:**
- Consumes: `createEntityHooks` (`@/api/entityFactory`), `Disciplina`, `DisciplinaInput` (`@/types/disciplina`)
- Produces: `useDisciplinas(): UseQueryResult<Disciplina[]>`, `useCreateDisciplina(): UseMutationResult<Disciplina, unknown, DisciplinaInput>`, `useUpdateDisciplina(): UseMutationResult<Disciplina, unknown, { id: number; input: DisciplinaInput }>`, `useDeleteDisciplina(): UseMutationResult<void, unknown, number>`. Usados por `DisciplinasPage` (Task 6).

- [ ] **Step 1: Criar `src/features/disciplinas/useDisciplinas.ts`**

```ts
import { createEntityHooks } from "@/api/entityFactory";
import type { Disciplina, DisciplinaInput } from "@/types/disciplina";

const disciplinaHooks = createEntityHooks<Disciplina, DisciplinaInput>(
  "disciplinas",
  "Disciplina",
);

export const useDisciplinas = disciplinaHooks.useList;
export const useCreateDisciplina = disciplinaHooks.useCreate;
export const useUpdateDisciplina = disciplinaHooks.useUpdate;
export const useDeleteDisciplina = disciplinaHooks.useDelete;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona hooks useDisciplinas via entityFactory"
```

---

### Task 4: Schema de validação `disciplinaSchema` (Zod)

**Files:**
- Create: `src/features/disciplinas/disciplinaSchema.ts`

**Interfaces:**
- Produces: `disciplinaSchema: ZodSchema<DisciplinaFormValues>` e `type DisciplinaFormValues = { nome: string; cargaHoraria: number; professorId: number; alunosIds: number[] }`. Estruturalmente igual a `DisciplinaInput` (`@/types/disciplina`). Usado por `DisciplinaFormFields` (Task 5) e `DisciplinaFormModal` (Task 7).

- [ ] **Step 1: Criar `src/features/disciplinas/disciplinaSchema.ts`**

```ts
import { z } from "zod";

export const disciplinaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  cargaHoraria: z.coerce
    .number({ invalid_type_error: "Informe a carga horária." })
    .int("A carga horária deve ser um número inteiro.")
    .positive("A carga horária deve ser maior que zero."),
  professorId: z.coerce
    .number({ invalid_type_error: "Selecione um professor." })
    .int()
    .positive("Selecione um professor."),
  alunosIds: z.array(z.number()).min(1, "Selecione ao menos um aluno."),
});

export type DisciplinaFormValues = z.infer<typeof disciplinaSchema>;
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona schema de validacao disciplinaSchema"
```

---

### Task 5: Campos do formulário — `DisciplinaFormFields`

**Antes de implementar:** invocar a skill `frontend-design` (formulário com select e multi-select).

**Files:**
- Create: `src/features/disciplinas/DisciplinaFormFields.tsx`

**Interfaces:**
- Consumes: `Form, FormControl, FormField, FormItem, FormLabel, FormMessage` (`@/components/ui/form`), `Input` (`@/components/ui/input`), `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (`@/components/ui/select`), `MultiSelect` (`@/components/ui/multi-select`, Task 2), `UseFormReturn<DisciplinaFormValues>` (`react-hook-form`), `DisciplinaFormValues` (Task 4), `Professor` (`@/types/professor`), `Aluno` (`@/types/aluno`)
- Produces: `DisciplinaFormFields({ form, professores, alunos }: { form: UseFormReturn<DisciplinaFormValues>; professores: Professor[]; alunos: Aluno[] })`. Usado dentro do `FormModal` em `DisciplinaFormModal` (Task 7).

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/disciplinas/DisciplinaFormFields.tsx`**

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
import { MultiSelect } from "@/components/ui/multi-select";
import type { Professor } from "@/types/professor";
import type { Aluno } from "@/types/aluno";
import type { DisciplinaFormValues } from "./disciplinaSchema";

interface DisciplinaFormFieldsProps {
  form: UseFormReturn<DisciplinaFormValues>;
  professores: Professor[];
  alunos: Aluno[];
}

export function DisciplinaFormFields({ form, professores, alunos }: DisciplinaFormFieldsProps) {
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
                <Input placeholder="Álgebra Linear" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargaHoraria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carga horária (horas)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="60"
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="professorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professor responsável</FormLabel>
              <Select
                value={Number.isNaN(field.value) ? undefined : String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={String(professor.id)}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alunosIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alunos matriculados</FormLabel>
              <FormControl>
                <MultiSelect
                  options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione os alunos"
                />
              </FormControl>
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
git commit -m "feat: adiciona DisciplinaFormFields com select e multi-select"
```

---

### Task 6: `DisciplinasPage` — listagem, filtro e resolução via cache

**Antes de implementar:** invocar a skill `frontend-design` (tela completa de listagem).

**Files:**
- Create: `src/features/disciplinas/DisciplinasPage.tsx`

**Interfaces:**
- Consumes: `useDisciplinas` (Task 3), `useProfessores` (`@/features/professores/useProfessores`), `useAlunos` (`@/features/alunos/useAlunos`), `PageContainer`, `PageHeader`, `SectionCard`, `DataTable`, `DataTableColumn`, `SearchInput`, `LoadingState`, `ErrorState`, `EmptyState` (`@/components/shared/*`), `Button`, `Select*`, `Disciplina` (`@/types/disciplina`)
- Produces: `DisciplinasPage()` — default export usado em `src/App.tsx` (Task 9) na rota `/disciplinas`.

- [ ] **Step 1: Invocar a skill `frontend-design`**

- [ ] **Step 2: Criar `src/features/disciplinas/DisciplinasPage.tsx`**

```tsx
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
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
import type { Disciplina } from "@/types/disciplina";
import { useDisciplinas } from "./useDisciplinas";
import { useProfessores } from "@/features/professores/useProfessores";
import { useAlunos } from "@/features/alunos/useAlunos";
import { DisciplinaFormModal } from "./DisciplinaFormModal";
import { DisciplinaDeleteDialog } from "./DisciplinaDeleteDialog";

export default function DisciplinasPage() {
  const disciplinasQuery = useDisciplinas();
  const professoresQuery = useProfessores();
  const alunosQuery = useAlunos();

  const [search, setSearch] = useState("");
  const [professorFilter, setProfessorFilter] = useState("todos");
  const [formState, setFormState] = useState<{ open: boolean; disciplina: Disciplina | null }>({
    open: false,
    disciplina: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Disciplina | null>(null);

  const professores = professoresQuery.data ?? [];
  const disciplinas = disciplinasQuery.data ?? [];

  const professoresPorId = useMemo(
    () => new Map(professores.map((professor) => [professor.id, professor])),
    [professores],
  );

  const filteredDisciplinas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return disciplinas.filter((disciplina) => {
      const matchesSearch = term.length === 0 || disciplina.nome.toLowerCase().includes(term);
      const matchesProfessor =
        professorFilter === "todos" || disciplina.professorId === Number(professorFilter);
      return matchesSearch && matchesProfessor;
    });
  }, [disciplinas, search, professorFilter]);

  const isLoading =
    disciplinasQuery.isLoading || professoresQuery.isLoading || alunosQuery.isLoading;
  const isError = disciplinasQuery.isError || professoresQuery.isError || alunosQuery.isError;
  const firstError = disciplinasQuery.error ?? professoresQuery.error ?? alunosQuery.error;

  const columns: DataTableColumn<Disciplina>[] = [
    { key: "nome", header: "Nome", render: (disciplina) => disciplina.nome },
    {
      key: "cargaHoraria",
      header: "Carga horária",
      render: (disciplina) => `${disciplina.cargaHoraria}h`,
    },
    {
      key: "professor",
      header: "Professor responsável",
      render: (disciplina) => professoresPorId.get(disciplina.professorId)?.nome ?? "—",
    },
    {
      key: "alunos",
      header: "Alunos matriculados",
      render: (disciplina) => disciplina.alunosIds.length,
    },
    {
      key: "acoes",
      header: "Ações",
      className: "text-right",
      render: (disciplina) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${disciplina.nome}`}
            onClick={() => setFormState({ open: true, disciplina })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${disciplina.nome}`}
            onClick={() => setDeleteTarget(disciplina)}
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
        title="Disciplinas"
        description="Gerencie as disciplinas, seus professores e alunos matriculados."
        action={
          <Button onClick={() => setFormState({ open: true, disciplina: null })}>
            <Plus className="mr-2 h-4 w-4" />
            Nova disciplina
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." />
          <Select value={professorFilter} onValueChange={setProfessorFilter}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Professor responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os professores</SelectItem>
              {professores.map((professor) => (
                <SelectItem key={professor.id} value={String(professor.id)}>
                  {professor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? <LoadingState label="Carregando disciplinas..." /> : null}

        {!isLoading && isError ? (
          <ErrorState
            message={getApiErrorMessage(firstError)}
            onRetry={() => {
              disciplinasQuery.refetch();
              professoresQuery.refetch();
              alunosQuery.refetch();
            }}
          />
        ) : null}

        {!isLoading && !isError && filteredDisciplinas.length === 0 ? (
          <EmptyState
            title={
              disciplinas.length > 0
                ? "Nenhuma disciplina encontrada para os filtros atuais."
                : "Nenhuma disciplina cadastrada ainda."
            }
            description={
              disciplinas.length > 0
                ? "Ajuste a busca ou o filtro de professor."
                : "Comece cadastrando a primeira disciplina."
            }
            actionLabel={disciplinas.length > 0 ? undefined : "Nova disciplina"}
            onAction={
              disciplinas.length > 0
                ? undefined
                : () => setFormState({ open: true, disciplina: null })
            }
          />
        ) : null}

        {!isLoading && !isError && filteredDisciplinas.length > 0 ? (
          <DataTable
            key={`${search}-${professorFilter}`}
            data={filteredDisciplinas}
            columns={columns}
            getRowId={(disciplina) => disciplina.id}
          />
        ) : null}
      </SectionCard>

      <DisciplinaFormModal
        open={formState.open}
        disciplina={formState.disciplina}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <DisciplinaDeleteDialog
        disciplina={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
```

- [ ] **Step 3: Verificar**

```bash
npm run build
```

Esperado: **falha** nesta etapa (`DisciplinaFormModal` e `DisciplinaDeleteDialog` ainda não existem) — esperado neste ponto do plano; a verificação completa acontece ao final da Task 8. Não commitar ainda.

---

### Task 7: `DisciplinaFormModal` — criação/edição via `FormModal`

**Files:**
- Create: `src/features/disciplinas/DisciplinaFormModal.tsx`

**Interfaces:**
- Consumes: `FormModal` (`@/components/shared/FormModal`), `LoadingState` (`@/components/shared/LoadingState`), `DisciplinaFormFields` (Task 5), `disciplinaSchema`, `DisciplinaFormValues` (Task 4), `useCreateDisciplina`, `useUpdateDisciplina` (Task 3), `useProfessores` (`@/features/professores/useProfessores`), `useAlunos` (`@/features/alunos/useAlunos`), `Disciplina` (`@/types/disciplina`), `zodResolver`, `useForm`
- Produces: `DisciplinaFormModal({ open, disciplina, onOpenChange }: { open: boolean; disciplina: Disciplina | null; onOpenChange: (open: boolean) => void })`. Consumido por `DisciplinasPage` (Task 6).

- [ ] **Step 1: Criar `src/features/disciplinas/DisciplinaFormModal.tsx`**

```tsx
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import { LoadingState } from "@/components/shared/LoadingState";
import type { Disciplina } from "@/types/disciplina";
import { disciplinaSchema, type DisciplinaFormValues } from "./disciplinaSchema";
import { DisciplinaFormFields } from "./DisciplinaFormFields";
import { useCreateDisciplina, useUpdateDisciplina } from "./useDisciplinas";
import { useProfessores } from "@/features/professores/useProfessores";
import { useAlunos } from "@/features/alunos/useAlunos";

interface DisciplinaFormModalProps {
  open: boolean;
  disciplina: Disciplina | null;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: DisciplinaFormValues = {
  nome: "",
  cargaHoraria: NaN,
  professorId: NaN,
  alunosIds: [],
};

export function DisciplinaFormModal({ open, disciplina, onOpenChange }: DisciplinaFormModalProps) {
  const isEditing = disciplina !== null;
  const createDisciplina = useCreateDisciplina();
  const updateDisciplina = useUpdateDisciplina();
  const professoresQuery = useProfessores();
  const alunosQuery = useAlunos();
  const isLoadingOptions = professoresQuery.isLoading || alunosQuery.isLoading;
  const isSubmitting = createDisciplina.isPending || updateDisciplina.isPending;

  const form = useForm<DisciplinaFormValues>({
    resolver: zodResolver(disciplinaSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      disciplina
        ? {
            nome: disciplina.nome,
            cargaHoraria: disciplina.cargaHoraria,
            professorId: disciplina.professorId,
            alunosIds: disciplina.alunosIds,
          }
        : EMPTY_VALUES,
    );
  }, [open, disciplina, form]);

  function handleValid(values: DisciplinaFormValues) {
    if (isEditing) {
      updateDisciplina.mutate(
        { id: disciplina.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createDisciplina.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar disciplina" : "Nova disciplina"}
      description={
        isEditing ? "Atualize os dados da disciplina." : "Preencha os dados da nova disciplina."
      }
      onSubmit={form.handleSubmit(handleValid)}
      isSubmitting={isSubmitting || isLoadingOptions}
      submitLabel={isEditing ? "Salvar alterações" : "Criar disciplina"}
    >
      {isLoadingOptions ? (
        <LoadingState label="Carregando professores e alunos..." />
      ) : (
        <DisciplinaFormFields
          form={form}
          professores={professoresQuery.data ?? []}
          alunos={alunosQuery.data ?? []}
        />
      )}
    </FormModal>
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: **ainda falha** (`DisciplinaDeleteDialog` da Task 8 falta) — esperado neste ponto. Não commitar ainda.

---

### Task 8: `DisciplinaDeleteDialog` — exclusão via `ConfirmDialog`

**Files:**
- Create: `src/features/disciplinas/DisciplinaDeleteDialog.tsx`

**Interfaces:**
- Consumes: `ConfirmDialog` (`@/components/shared/ConfirmDialog`), `useDeleteDisciplina` (Task 3), `Disciplina` (`@/types/disciplina`)
- Produces: `DisciplinaDeleteDialog({ disciplina, onOpenChange }: { disciplina: Disciplina | null; onOpenChange: (open: boolean) => void })`. Consumido por `DisciplinasPage` (Task 6).

- [ ] **Step 1: Criar `src/features/disciplinas/DisciplinaDeleteDialog.tsx`**

```tsx
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Disciplina } from "@/types/disciplina";
import { useDeleteDisciplina } from "./useDisciplinas";

interface DisciplinaDeleteDialogProps {
  disciplina: Disciplina | null;
  onOpenChange: (open: boolean) => void;
}

export function DisciplinaDeleteDialog({ disciplina, onOpenChange }: DisciplinaDeleteDialogProps) {
  const deleteDisciplina = useDeleteDisciplina();

  return (
    <ConfirmDialog
      open={disciplina !== null}
      onOpenChange={onOpenChange}
      title="Excluir disciplina"
      description={
        disciplina
          ? `Tem certeza que deseja excluir "${disciplina.nome}"? Esta ação não pode ser desfeita.`
          : ""
      }
      isConfirming={deleteDisciplina.isPending}
      onConfirm={() => {
        if (!disciplina) return;
        deleteDisciplina.mutate(disciplina.id, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros (agora que `DisciplinasPage`, `DisciplinaFormModal` e `DisciplinaDeleteDialog` existem, todos os imports resolvem).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: adiciona DisciplinasPage com formulario e exclusao de disciplinas"
```

---

### Task 9: Conectar `/disciplinas` em `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `DisciplinasPage` (`@/features/disciplinas/DisciplinasPage`, Task 6, default export)

- [ ] **Step 1: Adicionar o import de `DisciplinasPage` em `src/App.tsx`**

```tsx
import DisciplinasPage from "@/features/disciplinas/DisciplinasPage";
```

- [ ] **Step 2: Substituir a rota `/disciplinas`**

Trocar:

```tsx
<Route path="/disciplinas" element={<PlaceholderPage title="Disciplinas" />} />
```

por:

```tsx
<Route path="/disciplinas" element={<DisciplinasPage />} />
```

- [ ] **Step 3: Verificar com build**

```bash
npm run build
```

Esperado: build conclui sem erros.

- [ ] **Step 4: Verificar manualmente com a API rodando**

Requer uma API real respondendo em `VITE_API_URL`, implementando `GET/POST/PUT/DELETE /disciplinas`, `GET /professores` e `GET /alunos` conforme `api-contract/openapi.yaml`. Idealmente já existem alguns professores e alunos cadastrados (via as telas dos planos anteriores) antes de testar esta tela.

```bash
npm run dev
```

Abrir `http://localhost:5173/disciplinas` e, com a API disponível, confirmar:
- Lista de disciplinas aparece com nome, carga horária, **nome do professor** (não o ID) e número de alunos matriculados.
- Buscar por nome filtra a tabela; filtrar por professor responsável também.
- "Nova disciplina" abre o modal: o select de professor lista os professores cadastrados; o multi-select de alunos permite marcar/desmarcar múltiplos alunos (os selecionados aparecem como badges removíveis); submeter sem selecionar nenhum aluno mostra o erro de validação "Selecione ao menos um aluno." sem chamar a API.
- Criar a disciplina via `POST /disciplinas` atualiza a lista e mostra o nome do professor corretamente resolvido.
- Editar abre o modal pré-preenchido (professor e alunos já marcados) e salva via `PUT /disciplinas/:id`.
- Excluir abre `ConfirmDialog` e remove via `DELETE /disciplinas/:id`.
- Lista vazia mostra `EmptyState` com CTA "Nova disciplina".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: conecta rota /disciplinas a DisciplinasPage"
```

---

## Self-Review desta plan

- **Cobertura do spec**: colunas nome/carga horária/professor responsável (resolvido via cache)/nº de alunos/ações ✅ (Task 6), filtro texto (nome) + professor responsável ✅ (Task 6), form nome/carga horária/select único de professor (obrigatório)/multi-select de alunos (obrigatório, 1+) ✅ (Tasks 4–5), checagem do registry do shadcn antes de construir o multi-select customizado ✅ (Task 2), criar/editar via `FormModal` ✅ (Task 7), excluir via `ConfirmDialog` ✅ (Task 8), Disciplina sem objetos aninhados no GET / resolução client-side via cache do TanStack Query ✅ (Task 6, reaproveitando `useProfessores`/`useAlunos` das outras features).
- **Placeholders**: nenhum. Sequência Task 6→7→8 com build intencionalmente quebrado documentado, igual aos planos anteriores.
- **Consistência de tipos**: `DisciplinaFormValues` (Task 4) espelha `DisciplinaInput` (`@/types/disciplina`, Fundação); `MultiSelectOption.value: number` e `selected: number[]` (Task 2) batem com `alunosIds: number[]` do schema; `useCreateDisciplina`/`useUpdateDisciplina` (Task 3) seguem a mesma assinatura de `createEntityHooks` já usada em Alunos e Professores.
