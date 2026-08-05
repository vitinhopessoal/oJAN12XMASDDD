import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import { pb } from "@/lib/pocketbase";

export type CollectionName = "bank_accounts" | "categories" | "transactions" | "commitments";

const QUERY_KEYS: Record<CollectionName, string[]> = {
  bank_accounts: ["accounts"],
  categories: ["categories"],
  transactions: ["transactions"],
  commitments: ["commitments"],
};

function useInvalidate(collection: CollectionName) {
  const queryClient = useQueryClient();
  return () => {
    for (const key of QUERY_KEYS[collection]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
    if (collection === "transactions") {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado";
}

export function useCreateRecord<T extends Record<string, unknown>>(
  collection: CollectionName,
): UseMutationResult<unknown, Error, T> {
  const invalidate = useInvalidate(collection);
  return useMutation({
    mutationFn: (data: T) => pb.collection(collection).create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Registro criado com sucesso");
    },
    onError: (error) => toast.error(`Não foi possível criar: ${errorMessage(error)}`),
  });
}

export function useUpdateRecord<T extends Record<string, unknown>>(
  collection: CollectionName,
): UseMutationResult<unknown, Error, { id: string; data: T }> {
  const invalidate = useInvalidate(collection);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: T }) =>
      pb.collection(collection).update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Registro atualizado");
    },
    onError: (error) => toast.error(`Não foi possível atualizar: ${errorMessage(error)}`),
  });
}

export function useDeleteRecord(
  collection: CollectionName,
): UseMutationResult<unknown, Error, string> {
  const invalidate = useInvalidate(collection);
  return useMutation({
    mutationFn: (id: string) => pb.collection(collection).delete(id),
    onSuccess: () => {
      invalidate();
      toast.success("Registro excluído");
    },
    onError: (error) => toast.error(`Não foi possível excluir: ${errorMessage(error)}`),
  });
}
