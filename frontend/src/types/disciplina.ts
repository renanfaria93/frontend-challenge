export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number;
  professorId: number;
  alunosIds: number[];
}

export type DisciplinaInput = Omit<Disciplina, "id">;
