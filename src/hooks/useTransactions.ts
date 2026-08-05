import { useQuery } from "@tanstack/react-query";

import { isBrowser, mapTransaction, monthKeyOf, monthRange, pb } from "@/lib/pocketbase";
import type { Transaction } from "@/types";

async function fetchTransactions(month?: Date | string): Promise<Transaction[]> {
  const options: Record<string, string> = {
    sort: "-date",
    expand: "bankAccount,category",
  };
  if (month) {
    const { start, end } = monthRange(month);
    options["filter"] = pb.filter("date >= {:start} && date <= {:end}", { start, end });
  }
  const records = await pb.collection("transactions").getFullList(options);
  return records.map(mapTransaction);
}

export function useTransactions(month?: Date | string): {
  transactions: Transaction[];
  monthIncome: number;
  monthExpense: number;
  isLoading: boolean;
  error: Error | null;
} {
  const key = month ? monthKeyOf(month) : "all";

  const query = useQuery({
    queryKey: ["transactions", key],
    queryFn: () => fetchTransactions(month),
    enabled: isBrowser,
  });

  const transactions = query.data ?? [];
  const monthIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.value, 0);
  const monthExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.value, 0);

  return {
    transactions,
    monthIncome,
    monthExpense,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
