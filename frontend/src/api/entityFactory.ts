import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, getApiErrorMessage } from "./client";

export function createEntityHooks<TEntity extends { id: number }, TInput>(
  endpoint: string,
  entityLabel: string,
) {
  const queryKey = [endpoint];

  function useList() {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const { data } = await apiClient.get<TEntity[]>(`/${endpoint}`);
        return data;
      },
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: TInput) => {
        const { data } = await apiClient.post<TEntity>(`/${endpoint}`, input);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`${entityLabel} criado com sucesso.`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, input }: { id: number; input: TInput }) => {
        const { data } = await apiClient.put<TEntity>(`/${endpoint}/${id}`, input);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`${entityLabel} atualizado com sucesso.`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/${endpoint}/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`${entityLabel} excluído com sucesso.`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }

  return { useList, useCreate, useUpdate, useDelete, queryKey };
}
