import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency, MONTHS_SHORT } from "@/lib/utils";

interface IncomeExpenseCardProps {
  incomeByMonth: number[];
  expenseByMonth: number[];
}

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-soft">
      <p className="font-medium">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="tabular-nums" style={{ color: item.color }}>
          {item.name}: {formatCurrency(item.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

export function IncomeExpenseCard({ incomeByMonth, expenseByMonth }: IncomeExpenseCardProps) {
  const data = MONTHS_SHORT.map((month, i) => ({
    month,
    receitas: incomeByMonth[i] ?? 0,
    despesas: expenseByMonth[i] ?? 0,
  }));

  const averageBalance =
    data.reduce((sum, d) => sum + (d.receitas - d.despesas), 0) / (data.length || 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold">Receitas × Despesas no ano</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Saldo médio mensal: {formatCurrency(averageBalance)}
      </p>
      <ChartContainer
        config={{
          receitas: { label: "Receitas", color: "#0CA678" },
          despesas: { label: "Despesas", color: "#DC2626" },
        }}
        className="mt-4 aspect-auto h-[280px] w-full"
      >
        <BarChart data={data} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            fontSize={11}
            tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`}
          />
          <ChartTooltip content={<TooltipBox />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={averageBalance} stroke="#087F5B" strokeDasharray="4 4" />
          <Bar dataKey="receitas" name="Receitas" fill="#0CA678" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface PlannedVsActualCardProps {
  monthTotals: number[];
  expenseByMonth: number[];
}

export function PlannedVsActualCard({ monthTotals, expenseByMonth }: PlannedVsActualCardProps) {
  const data = MONTHS_SHORT.map((month, i) => ({
    month,
    planejado: monthTotals[i] ?? 0,
    realizado: expenseByMonth[i] ?? 0,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold">Planejado × Realizado</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Compromissos previstos comparados às despesas efetivamente registradas.
      </p>
      <ChartContainer
        config={{
          planejado: { label: "Planejado", color: "#F59F00" },
          realizado: { label: "Realizado", color: "#4263EB" },
        }}
        className="mt-4 aspect-auto h-[280px] w-full"
      >
        <BarChart data={data} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            fontSize={11}
            tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`}
          />
          <ChartTooltip content={<TooltipBox />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="planejado" name="Planejado" fill="#F59F00" radius={[4, 4, 0, 0]} />
          <Bar dataKey="realizado" name="Realizado" fill="#4263EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
