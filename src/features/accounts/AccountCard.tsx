import { cn } from "@/lib/utils";
import { CurrencyText } from "@/components/ui/currency-text";
import type { BankAccount } from "@/types";

const typeLabel: Record<BankAccount["type"], string> = {
  CHECKING: "Conta corrente",
  INVESTMENT: "Investimentos",
  CASH: "Dinheiro",
};

export function AccountCard({
  account,
  className,
  actions,
}: {
  account: BankAccount;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft",
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: account.color }}
        aria-hidden
      />
      {actions ? <div className="absolute right-2 top-3">{actions}</div> : null}
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: account.color }}
          aria-hidden
        />
        <p className="text-sm font-medium">{account.name}</p>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{typeLabel[account.type]}</p>
      <CurrencyText value={account.initialBalance} className="mt-4 block text-xl font-semibold" />
    </div>
  );
}
