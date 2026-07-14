import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import type { Aluno } from "@/types/aluno";
import { alunoSchema, type AlunoFormValues } from "./alunoSchema";
import { AlunoFormFields } from "./AlunoFormFields";
import { useCreateAluno, useUpdateAluno } from "./useAlunos";

interface AlunoFormModalProps {
  open: boolean;
  aluno: Aluno | null;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: AlunoFormValues = {
  nome: "",
  email: "",
  matricula: "",
  dataNascimento: "",
  status: "ativo",
};

export function AlunoFormModal({ open, aluno, onOpenChange }: AlunoFormModalProps) {
  const isEditing = aluno !== null;
  const createAluno = useCreateAluno();
  const updateAluno = useUpdateAluno();
  const isSubmitting = createAluno.isPending || updateAluno.isPending;

  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      aluno
        ? {
            nome: aluno.nome,
            email: aluno.email,
            matricula: aluno.matricula,
            dataNascimento: aluno.dataNascimento,
            status: aluno.status,
          }
        : EMPTY_VALUES,
    );
  }, [open, aluno, form]);

  function handleValid(values: AlunoFormValues) {
    if (isEditing) {
      updateAluno.mutate(
        { id: aluno.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createAluno.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar aluno" : "Novo aluno"}
      description={
        isEditing ? "Atualize os dados do aluno." : "Preencha os dados do novo aluno."
      }
      onSubmit={form.handleSubmit(handleValid)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Criar aluno"}
    >
      <AlunoFormFields form={form} />
    </FormModal>
  );
}
