import { mockAccounts } from "@/mocks/data";
import type { BankAccount } from "@/types";

// MOCK: será substituído pelo PocketBase.
export function useAccounts(): { accounts: BankAccount[]; totalBalance: number } {
  const accounts = mockAccounts;
  const totalBalance = accounts.reduce((sum, a) => sum + a.initialBalance, 0);
  return { accounts, totalBalance };
}
