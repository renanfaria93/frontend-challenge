import { useAlunos } from "@/features/alunos/useAlunos";
import { useProfessores } from "@/features/professores/useProfessores";
import { useDisciplinas } from "@/features/disciplinas/useDisciplinas";

export function useDashboardSummary() {
  const alunosQuery = useAlunos();
  const professoresQuery = useProfessores();
  const disciplinasQuery = useDisciplinas();

  const isLoading =
    alunosQuery.isLoading || professoresQuery.isLoading || disciplinasQuery.isLoading;
  const isError = alunosQuery.isError || professoresQuery.isError || disciplinasQuery.isError;
  const error = alunosQuery.error ?? professoresQuery.error ?? disciplinasQuery.error;

  return {
    isLoading,
    isError,
    error,
    totals: {
      alunos: alunosQuery.data?.length ?? 0,
      professores: professoresQuery.data?.length ?? 0,
      disciplinas: disciplinasQuery.data?.length ?? 0,
    },
    refetch: () => {
      alunosQuery.refetch();
      professoresQuery.refetch();
      disciplinasQuery.refetch();
    },
  };
}
