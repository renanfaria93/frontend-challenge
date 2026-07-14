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
      const matchesSearch =
        term.length === 0 ||
        professor.nome.toLowerCase().includes(term) ||
        professor.email.toLowerCase().includes(term) ||
        professor.especialidade.toLowerCase().includes(term);
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar ${professor.nome}`}
            onClick={() => setFormState({ open: true, professor })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${professor.nome}`}
            onClick={() => setDeleteTarget(professor)}
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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, email ou especialidade..."
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

        {isLoading ? <LoadingState label="Carregando professores..." /> : null}

        {isError ? (
          <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
        ) : null}

        {!isLoading && !isError && filteredProfessores.length === 0 ? (
          <EmptyState
            title={
              professores && professores.length > 0
                ? "Nenhum professor encontrado para os filtros atuais."
                : "Nenhum professor cadastrado ainda."
            }
            description={
              professores && professores.length > 0
                ? "Ajuste a busca ou o filtro de status."
                : "Comece cadastrando o primeiro professor."
            }
            actionLabel={professores && professores.length > 0 ? undefined : "Novo professor"}
            onAction={
              professores && professores.length > 0
                ? undefined
                : () => setFormState({ open: true, professor: null })
            }
          />
        ) : null}

        {!isLoading && !isError && filteredProfessores.length > 0 ? (
          <DataTable
            key={`${search}-${statusFilter}`}
            data={filteredProfessores}
            columns={columns}
            getRowId={(professor) => professor.id}
          />
        ) : null}
      </SectionCard>

      <ProfessorFormModal
        open={formState.open}
        professor={formState.professor}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
      />

      <ProfessorDeleteDialog
        professor={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
