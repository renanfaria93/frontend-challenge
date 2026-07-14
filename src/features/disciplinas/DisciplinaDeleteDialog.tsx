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
