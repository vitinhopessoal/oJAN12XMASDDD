import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { isBrowser, mapCommitment, pb } from "@/lib/pocketbase";
import { parseMonthKey } from "@/lib/utils";
import type { Commitment } from "@/types";

/** Retorna o valor do compromisso no mês (ano/mês 0-11), ou 0 se não ocorre. */
export function commitmentValueAt(
  commitment: Commitment,
  year: number,
  month: number,
): number {
  const start = parseMonthKey(commitment.startMonth);
  const offset = (year - start.year) * 12 + (month - start.month);
  if (offset < 0) return 0;

  switch (commitment.recurrence) {
    case "FIXED":
      return commitment.value;
    case "ONCE":
      return offset === 0 ? commitment.value : 0;
    case "INSTALLMENT":
      return offset < (commitment.installments ?? 1) ? commitment.value : 0;
    default:
      return 0;
  }
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function isCommitmentPaid(commitment: Commitment, year: number, month: number): boolean {
  return (commitment.paidMonths ?? []).includes(monthKey(year, month));
}

async function fetchCommitments(): Promise<Commitment[]> {
  const records = await pb.collection("commitments").getFullList({ sort: "startMonth" });
  return records.map(mapCommitment);
}

/** Alterna um mês como pago/não pago, com atualização otimista e rollback. */
export function useTogglePaidMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commitment,
      month,
    }: {
      commitment: Commitment;
      month: string;
    }) => {
      const current = commitment.paidMonths ?? [];
      const next = current.includes(month)
        ? current.filter((m) => m !== month)
        : [...current, month].sort();
      await pb.collection("commitments").update(commitment.id, { paidMonths: next });
    },
    onMutate: async ({ commitment, month }) => {
      await queryClient.cancelQueries({ queryKey: ["commitments"] });
      const previous = queryClient.getQueryData<Commitment[]>(["commitments"]);
      queryClient.setQueryData<Commitment[]>(["commitments"], (old) =>
        (old ?? []).map((c) => {
          if (c.id !== commitment.id) return c;
          const current = c.paidMonths ?? [];
          return {
            ...c,
            paidMonths: current.includes(month)
              ? current.filter((m) => m !== month)
              : [...current, month].sort(),
          };
        }),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["commitments"], context.previous);
      toast.error("Não foi possível atualizar o pagamento");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["commitments"] });
    },
  });
}

export function useCommitments(year: number): {
  commitments: Commitment[];
  matrix: number[][];
  paidMatrix: boolean[][];
  monthTotals: number[];
  monthPaidTotals: number[];
  monthOpenTotals: number[];
  currentMonthTotal: number;
  currentMonthOpen: number;
  nextMonthTotal: number;
  futureAverage: number;
  isLoading: boolean;
  error: Error | null;
} {
  const query = useQuery({
    queryKey: ["commitments"],
    queryFn: fetchCommitments,
    enabled: isBrowser,
  });

  const commitments = query.data ?? [];
  const matrix = commitments.map((c) =>
    Array.from({ length: 12 }, (_, m) => commitmentValueAt(c, year, m)),
  );
  const paidMatrix = commitments.map((c) =>
    Array.from({ length: 12 }, (_, m) => isCommitmentPaid(c, year, m)),
  );
  const monthTotals = Array.from({ length: 12 }, (_, m) =>
    matrix.reduce((sum, row) => sum + (row[m] ?? 0), 0),
  );
  const monthPaidTotals = Array.from({ length: 12 }, (_, m) =>
    matrix.reduce((sum, row, i) => sum + (paidMatrix[i]?.[m] ? (row[m] ?? 0) : 0), 0),
  );
  const monthOpenTotals = monthTotals.map((total, m) => total - (monthPaidTotals[m] ?? 0));

  const today = new Date();
  const realYear = today.getFullYear();
  const realMonth = today.getMonth();

  const totalAt = (y: number, m: number) =>
    commitments.reduce((sum, c) => sum + commitmentValueAt(c, y, m), 0);
  const openAt = (y: number, m: number) =>
    commitments.reduce(
      (sum, c) => sum + (isCommitmentPaid(c, y, m) ? 0 : commitmentValueAt(c, y, m)),
      0,
    );

  const currentMonthTotal = totalAt(realYear, realMonth);
  const currentMonthOpen = openAt(realYear, realMonth);

  // Próximo mês de calendário real (vira janeiro do ano seguinte em dezembro).
  const nextDate = new Date(realYear, realMonth + 1, 1);
  const nextMonthTotal = totalAt(nextDate.getFullYear(), nextDate.getMonth());

  const future = monthTotals.slice(realYear === year ? realMonth + 1 : 0);
  const futureAverage = future.length
    ? future.reduce((s, v) => s + v, 0) / future.length
    : 0;

  return {
    commitments,
    matrix,
    paidMatrix,
    monthTotals,
    monthPaidTotals,
    monthOpenTotals,
    currentMonthTotal,
    currentMonthOpen,
    nextMonthTotal,
    futureAverage,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
