import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  matricula: z.string().trim().min(1, "Informe a matrícula."),
  dataNascimento: z.string().trim().min(1, "Informe a data de nascimento."),
  status: z.enum(["ativo", "inativo"]),
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;
