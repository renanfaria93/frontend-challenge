import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import type { Professor } from "@/types/professor";
import { professorSchema, type ProfessorFormValues } from "./professorSchema";
import { ProfessorFormFields } from "./ProfessorFormFields";
import { useCreateProfessor, useUpdateProfessor } from "./useProfessores";

interface ProfessorFormModalProps {
  open: boolean;
  professor: Professor | null;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: ProfessorFormValues = {
  nome: "",
  email: "",
  especialidade: "",
  status: "ativo",
};

export function ProfessorFormModal({ open, professor, onOpenChange }: ProfessorFormModalProps) {
  const isEditing = professor !== null;
  const createProfessor = useCreateProfessor();
  const updateProfessor = useUpdateProfessor();
  const isSubmitting = createProfessor.isPending || updateProfessor.isPending;

  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      professor
        ? {
            nome: professor.nome,
            email: professor.email,
            especialidade: professor.especialidade,
            status: professor.status,
          }
        : EMPTY_VALUES,
    );
  }, [open, professor, form]);

  function handleValid(values: ProfessorFormValues) {
    if (isEditing) {
      updateProfessor.mutate(
        { id: professor.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createProfessor.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar professor" : "Novo professor"}
      description={
        isEditing ? "Atualize os dados do professor." : "Preencha os dados do novo professor."
      }
      onSubmit={form.handleSubmit(handleValid)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Criar professor"}
    >
      <ProfessorFormFields form={form} />
    </FormModal>
  );
}
