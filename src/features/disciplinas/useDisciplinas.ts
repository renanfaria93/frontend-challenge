import { createEntityHooks } from "@/api/entityFactory";
import type { Disciplina, DisciplinaInput } from "@/types/disciplina";

const disciplinaHooks = createEntityHooks<Disciplina, DisciplinaInput>(
  "disciplinas",
  "Disciplina",
);

export const useDisciplinas = disciplinaHooks.useList;
export const useCreateDisciplina = disciplinaHooks.useCreate;
export const useUpdateDisciplina = disciplinaHooks.useUpdate;
export const useDeleteDisciplina = disciplinaHooks.useDelete;
