import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
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
import { DisciplinaAlunosDialog } from "./DisciplinaAlunosDialog";

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
  const [alunosTarget, setAlunosTarget] = useState<Disciplina | null>(null);

  const professores = professoresQuery.data ?? [];
  const disciplinas = disciplinasQuery.data ?? [];
  const alunos = alunosQuery.data ?? [];

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
            aria-label={`Ver alunos matriculados em ${disciplina.nome}`}
            onClick={() => setAlunosTarget(disciplina)}
          >
            <Users className="h-4 w-4" />
          </Button>
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

      <DisciplinaAlunosDialog
        disciplina={alunosTarget}
        alunos={alunos}
        onOpenChange={(open) => !open && setAlunosTarget(null)}
      />
    </PageContainer>
  );
}
