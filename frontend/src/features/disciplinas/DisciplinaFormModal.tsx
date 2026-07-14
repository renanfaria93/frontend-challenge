import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
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
    resolver: zodResolver(disciplinaSchema) as Resolver<DisciplinaFormValues>,
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
