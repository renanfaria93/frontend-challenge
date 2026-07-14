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
