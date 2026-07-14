import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { Professor } from "@/types/professor";
import type { Aluno } from "@/types/aluno";
import type { DisciplinaFormValues } from "./disciplinaSchema";

interface DisciplinaFormFieldsProps {
  form: UseFormReturn<DisciplinaFormValues>;
  professores: Professor[];
  alunos: Aluno[];
}

export function DisciplinaFormFields({ form, professores, alunos }: DisciplinaFormFieldsProps) {
  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Álgebra Linear" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargaHoraria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carga horária (horas)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="60"
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="professorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professor responsável</FormLabel>
              <Select
                value={Number.isNaN(field.value) ? undefined : String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={String(professor.id)}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alunosIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alunos matriculados</FormLabel>
              <FormControl>
                <MultiSelect
                  options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione os alunos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
