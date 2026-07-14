import { createEntityHooks } from "@/api/entityFactory";
import type { Aluno, AlunoInput } from "@/types/aluno";

const alunoHooks = createEntityHooks<Aluno, AlunoInput>("alunos", "Aluno");

export const useAlunos = alunoHooks.useList;
export const useCreateAluno = alunoHooks.useCreate;
export const useUpdateAluno = alunoHooks.useUpdate;
export const useDeleteAluno = alunoHooks.useDelete;
