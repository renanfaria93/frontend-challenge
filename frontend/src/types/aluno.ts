import type { StatusEntidade } from "./common";

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  dataNascimento: string;
  status: StatusEntidade;
}

export type AlunoInput = Omit<Aluno, "id">;
