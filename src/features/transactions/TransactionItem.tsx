import { cn, formatDate } from "@/lib/utils";
import { CurrencyText } from "@/components/ui/currency-text";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BankAccount, Category, Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  account: BankAccount | undefined;
  onClick?: () => void;
  onToggleStatus?: () => void;
  actions?: React.ReactNode;
}

export function TransactionItem({
  transaction,
  category,
  account,
  onClick,
  onToggleStatus,
  actions,
}: TransactionItemProps) {
  const isIncome = transaction.type === "INCOME";
  const isPaid = transaction.status === "PAID";

  const badge = (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        isPaid ? "bg-primary-soft text-primary" : "bg-pending-soft text-pending",
        onToggleStatus && "cursor-pointer",
      )}
      onClick={
        onToggleStatus
          ? (event) => {
              event.stopPropagation();
              onToggleStatus();
            }
          : undefined
      }
    >
      {isPaid ? "Pago" : "Pendente"}
    </span>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/70 py-3 last:border-0",
        onClick && "cursor-pointer transition hover:bg-accent/40",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isIncome ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
        )}
      >
        <CategoryIcon name={category?.icon ?? "Circle"} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.name || "Sem descrição"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {account?.name ?? "Sem conta"} · {category?.name ?? "Sem categoria"} ·{" "}
          {formatDate(transaction.date)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <CurrencyText
          value={isIncome ? transaction.value : -transaction.value}
          signed
          className={cn("text-sm font-semibold", isIncome ? "text-income" : "text-expense")}
        />
        {onToggleStatus ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>
              <TooltipContent>Clique para alternar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          badge
        )}
      </div>

      {actions ? (
        <div onClick={(event) => event.stopPropagation()} className="shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
