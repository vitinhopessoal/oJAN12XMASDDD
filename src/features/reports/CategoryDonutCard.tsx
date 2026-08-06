import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CurrencyText } from "@/components/ui/currency-text";
import { MonthSelector } from "@/components/layout/MonthSelector";
import { colorForId } from "./palette";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types";

interface Slice {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutCardProps {
  data: { categoryId: string; total: number }[];
  categories: Record<string, Category>;
  monthIndex: number;
  year: number;
  onMonthChange: (monthIndex: number, year: number) => void;
}

export function CategoryDonutCard({
  data,
  categories,
  monthIndex,
  year,
  onMonthChange,
}: CategoryDonutCardProps) {
  const slices: Slice[] = useMemo(
    () =>
      data.map((item) => ({
        id: item.categoryId,
        name: categories[item.categoryId]?.name ?? "Sem categoria",
        value: item.total,
        color: colorForId(item.categoryId),
      })),
    [data, categories],
  );

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Despesas por categoria</h2>
        <MonthSelector monthIndex={monthIndex} year={year} onChange={onMonthChange} />
      </div>

      {slices.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhuma despesa registrada neste mês.
        </p>
      ) : (
        <>
          <div className="relative">
            <ChartContainer config={{}} className="mt-4 aspect-auto h-[260px] w-full">
              <PieChart>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const slice = payload[0]?.payload as Slice;
                    const pct = total > 0 ? (slice.value / total) * 100 : 0;
                    return (
                      <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-soft">
                        <p className="font-medium">{slice.name}</p>
                        <p className="tabular-nums text-muted-foreground">
                          {formatCurrency(slice.value)} · {pct.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.id} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Total do mês</span>
              <CurrencyText value={total} className="text-xl font-semibold" />
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {slices.map((slice) => (
              <li key={slice.id} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-muted-foreground">{slice.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
