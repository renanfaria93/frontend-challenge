import { createEntityHooks } from "@/api/entityFactory";
import type { Professor, ProfessorInput } from "@/types/professor";

const professorHooks = createEntityHooks<Professor, ProfessorInput>("professores", "Professor");

export const useProfessores = professorHooks.useList;
export const useCreateProfessor = professorHooks.useCreate;
export const useUpdateProfessor = professorHooks.useUpdate;
export const useDeleteProfessor = professorHooks.useDelete;
