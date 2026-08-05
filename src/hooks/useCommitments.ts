import { mockCommitments } from "@/mocks/data";
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

// MOCK: será substituído pelo PocketBase.
export function useCommitments(year: number): {
  commitments: Commitment[];
  matrix: number[][];
  monthTotals: number[];
  currentMonthTotal: number;
  nextMonthTotal: number;
  futureAverage: number;
} {
  const commitments = mockCommitments;
  const matrix = commitments.map((c) =>
    Array.from({ length: 12 }, (_, m) => commitmentValueAt(c, year, m)),
  );
  const monthTotals = Array.from({ length: 12 }, (_, m) =>
    matrix.reduce((sum, row) => sum + (row[m] ?? 0), 0),
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentMonthTotal = monthTotals[currentMonth] ?? 0;
  const nextMonthTotal = monthTotals[currentMonth + 1] ?? 0;
  const future = monthTotals.slice(currentMonth + 1);
  const futureAverage = future.length
    ? future.reduce((s, v) => s + v, 0) / future.length
    : 0;

  return {
    commitments,
    matrix,
    monthTotals,
    currentMonthTotal,
    nextMonthTotal,
    futureAverage,
  };
}
