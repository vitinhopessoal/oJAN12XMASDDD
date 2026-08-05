import { mockTransactions } from "@/mocks/data";
import type { Transaction } from "@/types";

// MOCK: será substituído pelo PocketBase.
export function useTransactions(): {
  transactions: Transaction[];
  monthIncome: number;
  monthExpense: number;
} {
  const transactions = [...mockTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const monthIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.value, 0);
  const monthExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.value, 0);

  return { transactions, monthIncome, monthExpense };
}
