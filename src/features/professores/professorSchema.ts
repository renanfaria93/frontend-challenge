import { z } from "zod";

export const professorSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  especialidade: z.string().trim().min(1, "Informe a especialidade."),
  status: z.enum(["ativo", "inativo"]),
});

export type ProfessorFormValues = z.infer<typeof professorSchema>;
