import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { isBrowser, mapAccount, mapTransaction, pb } from "@/lib/pocketbase";
import type { BankAccount, Transaction } from "@/types";

async function fetchAccounts(): Promise<BankAccount[]> {
  const records = await pb.collection("bank_accounts").getFullList({ sort: "name" });
  return records.map(mapAccount);
}

async function fetchAllTransactions(): Promise<Transaction[]> {
  const records = await pb.collection("transactions").getFullList({ sort: "-date" });
  return records.map(mapTransaction).filter((t) => !t.needsReview);
}

export function useAccounts(): {
  accounts: BankAccount[];
  totalBalance: number;
  isLoading: boolean;
  error: Error | null;
} {
  const accountsQuery: UseQueryResult<BankAccount[]> = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
    enabled: isBrowser,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: fetchAllTransactions,
    enabled: isBrowser,
  });

  const transactions = transactionsQuery.data ?? [];

  const accounts = (accountsQuery.data ?? []).map((account) => {
    const delta = transactions
      .filter((t) => t.bankAccountId === account.id && t.status === "PAID")
      .reduce((sum, t) => sum + (t.type === "INCOME" ? t.value : -t.value), 0);
    return { ...account, initialBalance: account.initialBalance + delta };
  });

  const totalBalance = accounts.reduce((sum, a) => sum + a.initialBalance, 0);

  return {
    accounts,
    totalBalance,
    isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
    error: (accountsQuery.error ?? transactionsQuery.error) as Error | null,
  };
}
