import { useState } from "react";
import { Award, Plus, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CurrencyText } from "@/components/ui/currency-text";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RowActions } from "@/components/layout/RowActions";
import { ProgressRing } from "./ProgressRing";
import { MILESTONES, monthAbbrLabel } from "./celebrate";
import { cn, formatCurrency } from "@/lib/utils";
import type { GoalStats } from "@/hooks/useGoals";

interface GoalCardProps {
  stats: GoalStats;
  onContribute: () => void;
  onOpenHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ stats, onContribute, onOpenHistory, onEdit, onDelete }: GoalCardProps) {
  const [hover, setHover] = useState(false);
  const { goal, progressPct, investedTotal, remaining, completed, projectedDate } = stats;

  let projection: string;
  if (completed) {
    projection = "Meta concluída 🏆";
  } else if (projectedDate) {
    projection = `Nesse ritmo: conclui em ${monthAbbrLabel(projectedDate)}`;
  } else {
    projection = "Comece a aportar para ver sua projeção";
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft transition",
        completed ? "border-2 border-[#D4A017]" : "border-border",
        hover && "shadow-lg",
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex flex-1 items-start gap-3 text-left"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: goal.color }}
          >
            <CategoryIcon name={goal.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{goal.name}</p>
            <p className="text-xs text-muted-foreground">
              meta de {formatCurrency(goal.targetValue)}
            </p>
          </div>
        </button>
        <RowActions
          label={goal.name}
          onEdit={onEdit}
          onDelete={onDelete}
          extraItems={[{ label: "Ver histórico", onSelect: onOpenHistory }]}
        />
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing value={progressPct} color={goal.color} size={92} />
        <div className="min-w-0 flex-1">
          <CurrencyText value={investedTotal} className="block text-lg font-semibold" />
          <p className="text-xs text-muted-foreground">de {formatCurrency(goal.targetValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {completed ? "meta atingida" : `faltam ${formatCurrency(remaining)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {MILESTONES.map((m) => {
          const reached = progressPct >= m;
          return (
            <Tooltip key={m}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition",
                    reached ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground/40",
                  )}
                >
                  <Award className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {reached ? `Marco de ${m}% atingido!` : `Marco de ${m}%`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="space-y-1 text-xs">
        <p className="text-muted-foreground">{projection}</p>
        {goal.deadline && !completed && stats.onTrack !== null ? (
          <p className={stats.onTrack ? "text-income" : "text-pending"}>
            {stats.onTrack
              ? "no prazo ✓"
              : `ritmo abaixo do necessário — aporte ${formatCurrency(
                  stats.requiredMonthly,
                )}/mês para chegar`}
          </p>
        ) : null}
      </div>

      <Button
        onClick={completed ? onOpenHistory : onContribute}
        variant={completed ? "outline" : "default"}
        className="w-full"
      >
        {completed ? (
          <>
            <History className="mr-2 h-4 w-4" /> Ver histórico
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> Aporte
          </>
        )}
      </Button>
    </div>
  );
}
