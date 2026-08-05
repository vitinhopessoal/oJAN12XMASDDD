import { cn, formatCurrency } from "@/lib/utils";
import { useAppSettings } from "@/hooks/useAppSettings";

interface CurrencyTextProps {
  value: number;
  className?: string;
  signed?: boolean;
}

export function CurrencyText({ value, className, signed }: CurrencyTextProps) {
  const { hidden } = useAppSettings();

  if (hidden) {
    return <span className={cn("money", className)}>•••••</span>;
  }

  const prefix = signed ? (value < 0 ? "- " : "+ ") : "";
  return (
    <span className={cn("money", className)}>
      {prefix}
      {formatCurrency(Math.abs(value))}
    </span>
  );
}
