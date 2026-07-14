import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Aluno } from "@/types/aluno";
import type { Disciplina } from "@/types/disciplina";

interface DisciplinaAlunosDialogProps {
  disciplina: Disciplina | null;
  alunos: Aluno[];
  onOpenChange: (open: boolean) => void;
}

export function DisciplinaAlunosDialog({
  disciplina,
  alunos,
  onOpenChange,
}: DisciplinaAlunosDialogProps) {
  const alunosPorId = new Map(alunos.map((aluno) => [aluno.id, aluno]));
  const alunosMatriculados = disciplina
    ? disciplina.alunosIds
        .map((id) => alunosPorId.get(id))
        .filter((aluno): aluno is Aluno => aluno !== undefined)
    : [];

  return (
    <Dialog open={disciplina !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{disciplina?.nome}</DialogTitle>
          <DialogDescription>
            {alunosMatriculados.length === 1
              ? "1 aluno matriculado"
              : `${alunosMatriculados.length} alunos matriculados`}
          </DialogDescription>
        </DialogHeader>

        {alunosMatriculados.length === 0 ? (
          <EmptyState
            title="Nenhum aluno matriculado nesta disciplina."
            description="Alunos matriculados aparecerão aqui."
          />
        ) : (
          <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            {alunosMatriculados.map((aluno) => (
              <li
                key={aluno.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{aluno.nome}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Matrícula {aluno.matricula} · {aluno.email}
                  </p>
                </div>
                <StatusBadge status={aluno.status} />
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
