import { cn, formatCurrency, MONTHS_SHORT } from "@/lib/utils";
import { useAppSettings } from "@/hooks/useAppSettings";
import type { Commitment } from "@/types";

interface PlanningGridProps {
  commitments: Commitment[];
  matrix: number[][];
  monthTotals: number[];
  year: number;
}

export function PlanningGrid({ commitments, matrix, monthTotals, year }: PlanningGridProps) {
  const { hidden } = useAppSettings();
  const today = new Date();
  const currentMonth = today.getFullYear() === year ? today.getMonth() : -1;

  const cellValue = (v: number) => (v === 0 ? "" : hidden ? "•••" : formatCurrency(v));

  const monthClass = (m: number) =>
    cn(
      "px-3 py-2 text-right whitespace-nowrap tabular-nums",
      m === currentMonth && "bg-primary-soft/70 border-x border-primary/30",
      currentMonth >= 0 && m < currentMonth && "opacity-50",
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <table className="w-full min-w-[860px] border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="sticky left-0 z-20 bg-muted/95 px-4 py-3 text-left font-medium text-muted-foreground backdrop-blur">
              Compromisso
            </th>
            {MONTHS_SHORT.map((m, i) => (
              <th
                key={m}
                className={cn(
                  "px-3 py-3 text-right text-[11px] font-semibold tracking-wide text-muted-foreground",
                  i === currentMonth && "bg-primary-soft text-primary border-x border-primary/30",
                  currentMonth >= 0 && i < currentMonth && "opacity-50",
                )}
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {commitments.map((c, rowIndex) => (
            <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
              <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-normal">
                <span
                  className="inline-flex max-w-[160px] items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-medium text-white sm:max-w-none sm:text-xs"
                  style={{ backgroundColor: c.color }}
                >
                  <span className="truncate">{c.name}</span>
                </span>
              </th>
              {Array.from({ length: 12 }, (_, m) => (
                <td key={m} className={monthClass(m)}>
                  {cellValue(matrix[rowIndex]?.[m] ?? 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-primary/30 bg-muted/60 font-semibold">
            <th className="sticky left-0 z-10 bg-muted/95 px-4 py-3 text-left backdrop-blur">
              TOTAL
            </th>
            {monthTotals.map((total, m) => (
              <td key={m} className={monthClass(m)}>
                {cellValue(total)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
