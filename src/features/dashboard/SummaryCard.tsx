import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyText } from "@/components/ui/currency-text";

type Tone = "neutral" | "income" | "expense" | "pending" | "primary";

const tones: Record<Tone, { wrap: string; icon: string; value: string }> = {
  neutral: { wrap: "bg-card", icon: "bg-muted text-muted-foreground", value: "text-foreground" },
  income: { wrap: "bg-card", icon: "bg-income-soft text-income", value: "text-income" },
  expense: { wrap: "bg-card", icon: "bg-expense-soft text-expense", value: "text-expense" },
  pending: { wrap: "bg-card", icon: "bg-pending-soft text-pending", value: "text-pending" },
  primary: { wrap: "bg-card", icon: "bg-primary-soft text-primary", value: "text-primary" },
};

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "neutral",
  className,
}: SummaryCardProps) {
  const t = tones[tone];
  return (
    <div className={cn("rounded-2xl border border-border p-5 shadow-soft", t.wrap, className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.icon)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <CurrencyText value={value} className={cn("mt-3 block text-2xl font-semibold", t.value)} />
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
