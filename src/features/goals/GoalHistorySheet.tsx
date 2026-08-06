import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CurrencyText } from "@/components/ui/currency-text";
import { RowActions } from "@/components/layout/RowActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteRecord } from "@/hooks/mutations";
import { ContributionFormDialog } from "./ContributionFormDialog";
import { formatCurrency } from "@/lib/utils";
import type { GoalStats } from "@/hooks/useGoals";
import type { Contribution } from "@/types";

function formatFullDate(value: string): string {
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

interface GoalHistorySheetProps {
  stats: GoalStats | null;
  onOpenChange: (open: boolean) => void;
}

export function GoalHistorySheet({ stats, onOpenChange }: GoalHistorySheetProps) {
  const [editing, setEditing] = useState<Contribution | null>(null);
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const remove = useDeleteRecord("contributions");

  if (!stats) return null;

  const ordered = [...stats.contributions].sort((a, b) => (a.date < b.date ? -1 : 1));
  let running = 0;
  const chartData = ordered.map((c) => {
    running += c.value;
    return { date: formatFullDate(c.date), total: running };
  });

  return (
    <>
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{stats.goal.name}</SheetTitle>
            <SheetDescription>
              {formatCurrency(stats.investedTotal)} investidos de{" "}
              {formatCurrency(stats.goal.targetValue)}
            </SheetDescription>
          </SheetHeader>

          {chartData.length > 1 ? (
            <ChartContainer
              config={{ total: { label: "Acumulado", color: stats.goal.color } }}
              className="h-40 w-full"
            >
              <AreaChart data={chartData} margin={{ left: 4, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="goalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stats.goal.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={stats.goal.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <ChartTooltip
                  formatter={(value: number | string) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={stats.goal.color}
                  fill="url(#goalFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : null}

          <div className="space-y-1">
            {stats.contributions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum aporte registrado ainda.
              </p>
            ) : null}
            {stats.contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-accent/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{formatFullDate(c.date)}</p>
                  {c.note ? (
                    <p className="truncate text-xs text-muted-foreground">{c.note}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <CurrencyText value={c.value} className="text-sm font-semibold text-income" />
                  <RowActions
                    label="aporte"
                    onEdit={() => setEditing(c)}
                    onDelete={() => setToDelete(c)}
                  />
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {editing ? (
        <ContributionFormDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          stats={stats}
          contribution={editing}
        />
      ) : null}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita e o valor sairá do total investido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove.mutate(toDelete.id);
                setToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
