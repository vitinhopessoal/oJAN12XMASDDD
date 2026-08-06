import { useQuery } from "@tanstack/react-query";

import { isBrowser, mapContribution, mapGoal, pb } from "@/lib/pocketbase";
import type { Contribution, InvestmentGoal } from "@/types";

export interface GoalStats {
  goal: InvestmentGoal;
  contributions: Contribution[];
  investedTotal: number;
  progressPct: number;
  remaining: number;
  monthlyAverage: number;
  monthlyRate: number;
  monthsRemaining: number | null;
  projectedDate: Date | null;
  contributedThisMonth: number;
  onTrack: boolean | null;
  requiredMonthly: number;
  completed: boolean;
}

function monthKeyOfDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function fetchGoals(): Promise<InvestmentGoal[]> {
  const records = await pb.collection("investment_goals").getFullList({ sort: "name" });
  return records.map(mapGoal);
}

async function fetchContributions(): Promise<Contribution[]> {
  const records = await pb.collection("contributions").getFullList({ sort: "-date" });
  return records.map(mapContribution);
}

/** Nº de meses restantes até a meta, dado um ritmo mensal. */
function monthsToFinish(remaining: number, rate: number): number | null {
  if (remaining <= 0) return 0;
  if (rate <= 0) return null;
  return Math.ceil(remaining / rate);
}

export function useGoals(): {
  goals: GoalStats[];
  totalInvested: number;
  totalTargets: number;
  plannedThisMonth: number;
  contributedThisMonth: number;
  overallPct: number;
  streak: number;
  isLoading: boolean;
  error: Error | null;
} {
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    enabled: isBrowser,
  });
  const contributionsQuery = useQuery({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
    enabled: isBrowser,
  });

  const goals = goalsQuery.data ?? [];
  const contributions = contributionsQuery.data ?? [];

  const today = new Date();
  const currentKey = monthKeyOfDate(today);

  const stats: GoalStats[] = goals.map((goal) => {
    const list = contributions
      .filter((c) => c.goalId === goal.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const investedTotal = list.reduce((sum, c) => sum + c.value, 0);
    const remaining = Math.max(goal.targetValue - investedTotal, 0);
    const progressPct = goal.targetValue > 0
      ? Math.min((investedTotal / goal.targetValue) * 100, 100)
      : 0;

    // Média dos últimos 6 meses que tiveram aporte.
    const byMonth = new Map<string, number>();
    for (const c of list) {
      const key = c.date.slice(0, 7);
      byMonth.set(key, (byMonth.get(key) ?? 0) + c.value);
    }
    const lastMonths = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 6);
    const monthlyAverage = lastMonths.length
      ? lastMonths.reduce((s, [, v]) => s + v, 0) / lastMonths.length
      : 0;

    const monthlyRate = goal.monthlyPlan > 0 ? goal.monthlyPlan : monthlyAverage;
    const monthsRemaining = monthsToFinish(remaining, monthlyRate);
    const projectedDate =
      monthsRemaining === null
        ? null
        : new Date(today.getFullYear(), today.getMonth() + monthsRemaining, 1);

    let onTrack: boolean | null = null;
    let requiredMonthly = 0;
    if (goal.deadline && remaining > 0) {
      const [dy, dm] = goal.deadline.split("-");
      const monthsLeft =
        (Number(dy) - today.getFullYear()) * 12 + (Number(dm) - 1 - today.getMonth()) + 1;
      requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;
      onTrack = monthlyRate >= requiredMonthly;
    }

    return {
      goal,
      contributions: list,
      investedTotal,
      progressPct,
      remaining,
      monthlyAverage,
      monthlyRate,
      monthsRemaining,
      projectedDate,
      contributedThisMonth: byMonth.get(currentKey) ?? 0,
      onTrack,
      requiredMonthly,
      completed: goal.targetValue > 0 && investedTotal >= goal.targetValue,
    };
  });

  const totalInvested = stats.reduce((s, g) => s + g.investedTotal, 0);
  const totalTargets = goals.reduce((s, g) => s + g.targetValue, 0);
  const plannedThisMonth = goals.reduce((s, g) => s + g.monthlyPlan, 0);
  const contributedThisMonth = contributions
    .filter((c) => c.date.slice(0, 7) === currentKey)
    .reduce((s, c) => s + c.value, 0);

  // Sequência de meses consecutivos com pelo menos um aporte.
  const monthsWith = new Set(contributions.map((c) => c.date.slice(0, 7)));
  let streak = 0;
  let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  if (!monthsWith.has(monthKeyOfDate(cursor))) {
    cursor = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  }
  while (monthsWith.has(monthKeyOfDate(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
  }

  return {
    goals: stats,
    totalInvested,
    totalTargets,
    plannedThisMonth,
    contributedThisMonth,
    overallPct: totalTargets > 0 ? Math.min((totalInvested / totalTargets) * 100, 100) : 0,
    streak,
    isLoading: goalsQuery.isLoading || contributionsQuery.isLoading,
    error: (goalsQuery.error ?? contributionsQuery.error) as Error | null,
  };
}
