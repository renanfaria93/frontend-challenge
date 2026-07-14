import { z } from "zod";

export const disciplinaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  cargaHoraria: z.coerce
    .number({ error: "Informe a carga horária." })
    .int("A carga horária deve ser um número inteiro.")
    .positive("A carga horária deve ser maior que zero."),
  professorId: z.coerce
    .number({ error: "Selecione um professor." })
    .int()
    .positive("Selecione um professor."),
  alunosIds: z.array(z.number()).min(1, "Selecione ao menos um aluno."),
});

export type DisciplinaFormValues = z.infer<typeof disciplinaSchema>;
