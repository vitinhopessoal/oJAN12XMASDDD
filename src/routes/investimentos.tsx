import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Plus, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyText } from "@/components/ui/currency-text";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { GoalCard } from "@/features/goals/GoalCard";
import { GoalFormDialog, type GoalPreset } from "@/features/goals/GoalFormDialog";
import { ContributionFormDialog } from "@/features/goals/ContributionFormDialog";
import { GoalHistorySheet } from "@/features/goals/GoalHistorySheet";
import { useGoals, type GoalStats } from "@/hooks/useGoals";
import { useDeleteRecord } from "@/hooks/mutations";
import { formatCurrency, MONTHS_LONG } from "@/lib/utils";
import { COLOR_PALETTE } from "@/components/ui/color-swatches";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Investimentos — Meu Bolso" },
      {
        name: "description",
        content: "Acompanhe suas metas de investimento, aportes mensais e projeções de conclusão.",
      },
      { property: "og:title", content: "Investimentos — Meu Bolso" },
      {
        property: "og:description",
        content: "Metas, aportes e progresso visual para manter a motivação em dia.",
      },
    ],
  }),
  component: InvestmentsPage,
});

const PRESETS: { emoji: string; label: string; preset: GoalPreset }[] = [
  {
    emoji: "🛡️",
    label: "Reserva de emergência",
    preset: {
      name: "Reserva de emergência",
      icon: "shield",
      color: COLOR_PALETTE[2] as string,
      targetValue: 10000,
      monthlyPlan: 500,
    },
  },
  {
    emoji: "🚗",
    label: "Comprar um carro",
    preset: {
      name: "Comprar um carro",
      icon: "car",
      color: COLOR_PALETTE[3] as string,
      targetValue: 40000,
      monthlyPlan: 800,
    },
  },
  {
    emoji: "✈️",
    label: "Viagem",
    preset: {
      name: "Viagem",
      icon: "plane",
      color: COLOR_PALETTE[5] as string,
      targetValue: 8000,
      monthlyPlan: 400,
    },
  },
];

function InvestmentsPage() {
  const {
    goals,
    totalInvested,
    totalTargets,
    plannedThisMonth,
    contributedThisMonth,
    overallPct,
    streak,
    isLoading,
  } = useGoals();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoalStats | null>(null);
  const [preset, setPreset] = useState<GoalPreset | null>(null);
  const [contributing, setContributing] = useState<GoalStats | null>(null);
  const [history, setHistory] = useState<GoalStats | null>(null);
  const [toDelete, setToDelete] = useState<GoalStats | null>(null);

  const removeGoal = useDeleteRecord("investment_goals");
  const removeContribution = useDeleteRecord("contributions");

  const monthLabel = (MONTHS_LONG[new Date().getMonth()] ?? "").toLowerCase();
  const monthPct =
    plannedThisMonth > 0 ? Math.min((contributedThisMonth / plannedThisMonth) * 100, 100) : 0;

  const openNew = (p: GoalPreset | null) => {
    setEditing(null);
    setPreset(p);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    for (const c of toDelete.contributions) {
      await removeContribution.mutateAsync(c.id);
    }
    await removeGoal.mutateAsync(toDelete.goal.id);
    setToDelete(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Investimentos"
          description="Metas, aportes e projeções para você chegar mais longe."
          icon={TrendingUp}
          action={
            goals.length > 0 ? (
              <Button onClick={() => openNew(null)}>
                <Plus className="mr-2 h-4 w-4" /> Nova meta
              </Button>
            ) : undefined
          }
        />

        <div className="grid gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-soft lg:grid-cols-2">
          <div>
            <p className="text-sm opacity-80">Total investido</p>
            <CurrencyText value={totalInvested} className="mt-1 block text-4xl font-semibold" />
            <p className="mt-1 text-xs opacity-80">de {formatCurrency(totalTargets)} em metas</p>
            <Progress value={overallPct} className="mt-3 bg-primary-foreground/20" />
            {streak > 0 ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs">
                <Flame className="h-3.5 w-3.5" /> {streak}{" "}
                {streak === 1 ? "mês seguido investindo" : "meses seguidos investindo"}
              </span>
            ) : null}
          </div>

          <div className="rounded-xl bg-primary-foreground/10 p-4">
            <p className="text-sm font-medium">
              {monthPct >= 100 && plannedThisMonth > 0
                ? "Plano do mês batido! 🔥"
                : `Aportes de ${monthLabel}`}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {formatCurrency(contributedThisMonth)} de {formatCurrency(plannedThisMonth)} planejado
            </p>
            <Progress value={monthPct} className="mt-3 bg-primary-foreground/20" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && goals.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Target className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold">
              Defina sua primeira meta e comece a construir seu futuro
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Escolha um objetivo, defina um aporte mensal e acompanhe o progresso.
            </p>
            <Button className="mt-5" onClick={() => openNew(null)}>
              <Plus className="mr-2 h-4 w-4" /> Criar primeira meta
            </Button>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => openNew(p.preset)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-accent"
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {goals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((stats) => (
              <GoalCard
                key={stats.goal.id}
                stats={stats}
                onContribute={() => setContributing(stats)}
                onOpenHistory={() => setHistory(stats)}
                onEdit={() => {
                  setPreset(null);
                  setEditing(stats);
                  setFormOpen(true);
                }}
                onDelete={() => setToDelete(stats)}
              />
            ))}
          </div>
        ) : null}

        <GoalFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditing(null);
              setPreset(null);
            }
          }}
          goal={editing?.goal}
          preset={preset ?? undefined}
        />

        {contributing ? (
          <ContributionFormDialog
            open
            onOpenChange={(open) => !open && setContributing(null)}
            stats={contributing}
          />
        ) : null}

        <GoalHistorySheet
          stats={history ? (goals.find((g) => g.goal.id === history.goal.id) ?? history) : null}
          onOpenChange={(open) => !open && setHistory(null)}
        />

        <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os {toDelete?.contributions.length ?? 0} aportes vinculados a{" "}
                {toDelete?.goal.name} também serão excluídos. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => void confirmDelete()}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
