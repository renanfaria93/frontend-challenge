import type { StatusEntidade } from "./common";

export interface Professor {
  id: number;
  nome: string;
  email: string;
  especialidade: string;
  status: StatusEntidade;
}

export type ProfessorInput = Omit<Professor, "id">;
