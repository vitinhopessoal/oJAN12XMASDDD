import { cn, formatDate } from "@/lib/utils";
import { CurrencyText } from "@/components/ui/currency-text";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { BankAccount, Category, Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  account: BankAccount | undefined;
}

export function TransactionItem({ transaction, category, account }: TransactionItemProps) {
  const isIncome = transaction.type === "INCOME";
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-3 last:border-0">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isIncome ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
        )}
      >
        <CategoryIcon name={category?.icon ?? "Circle"} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {account?.name ?? "—"} · {formatDate(transaction.date)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <CurrencyText
          value={isIncome ? transaction.value : -transaction.value}
          signed
          className={cn("text-sm font-semibold", isIncome ? "text-income" : "text-expense")}
        />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            transaction.status === "PAID"
              ? "bg-primary-soft text-primary"
              : "bg-pending-soft text-pending",
          )}
        >
          {transaction.status === "PAID" ? "Pago" : "Pendente"}
        </span>
      </div>
    </div>
  );
}
