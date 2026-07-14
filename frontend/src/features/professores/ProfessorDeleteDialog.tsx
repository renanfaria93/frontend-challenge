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
        professor
          ? `Tem certeza que deseja excluir "${professor.nome}"? Esta ação não pode ser desfeita. Se este professor estiver vinculado a alguma disciplina, a API pode recusar a exclusão.`
          : ""
      }
      isConfirming={deleteProfessor.isPending}
      onConfirm={() => {
        if (!professor) return;
        deleteProfessor.mutate(professor.id, { onSuccess: () => onOpenChange(false) });
      }}
    />
  );
}
