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
