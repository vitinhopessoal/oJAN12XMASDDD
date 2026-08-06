import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { isBrowser, mapTransaction, pb } from "@/lib/pocketbase";
import type { Transaction } from "@/types";

async function fetchYear(year: number): Promise<Transaction[]> {
  const records = await pb.collection("transactions").getFullList({
    sort: "-date",
    expand: "bankAccount,category",
    filter: pb.filter("date >= {:start} && date <= {:end}", {
      start: `${year}-01-01 00:00:00`,
      end: `${year}-12-31 23:59:59`,
    }),
  });
  return records.map(mapTransaction);
}

export interface YearAggregations {
  transactions: Transaction[];
  /** Receitas por mês (0-11). */
  incomeByMonth: number[];
  /** Despesas por mês (0-11). */
  expenseByMonth: number[];
  /** Despesas do mês informado agrupadas por categoria. */
  expenseByCategory: (monthIndex: number) => { categoryId: string; total: number }[];
  monthExpenseTotal: (monthIndex: number) => number;
  hasData: boolean;
  isLoading: boolean;
  error: Error | null;
}

function monthOf(date: string): number {
  return new Date(date).getMonth();
}

export function useYearTransactions(year: number): YearAggregations {
  const query = useQuery({
    queryKey: ["transactions", "year", year],
    queryFn: () => fetchYear(year),
    enabled: isBrowser,
  });

  const transactions = useMemo(() => query.data ?? [], [query.data]);

  const { incomeByMonth, expenseByMonth, byCategory } = useMemo(() => {
    const income = Array.from({ length: 12 }, () => 0);
    const expense = Array.from({ length: 12 }, () => 0);
    const cats: Record<number, Record<string, number>> = {};

    for (const t of transactions) {
      const m = monthOf(t.date);
      if (Number.isNaN(m)) continue;
      if (t.type === "INCOME") {
        income[m] = (income[m] ?? 0) + t.value;
      } else {
        expense[m] = (expense[m] ?? 0) + t.value;
        const bucket = (cats[m] ??= {});
        const key = t.categoryId || "sem-categoria";
        bucket[key] = (bucket[key] ?? 0) + t.value;
      }
    }
    return { incomeByMonth: income, expenseByMonth: expense, byCategory: cats };
  }, [transactions]);

  return {
    transactions,
    incomeByMonth,
    expenseByMonth,
    expenseByCategory: (monthIndex: number) =>
      Object.entries(byCategory[monthIndex] ?? {})
        .map(([categoryId, total]) => ({ categoryId, total }))
        .sort((a, b) => b.total - a.total),
    monthExpenseTotal: (monthIndex: number) => expenseByMonth[monthIndex] ?? 0,
    hasData: transactions.length > 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
