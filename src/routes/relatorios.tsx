import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PieChart } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDonutCard } from "@/features/reports/CategoryDonutCard";
import { IncomeExpenseCard, PlannedVsActualCard } from "@/features/reports/YearCharts";
import { TopCategoriesCard } from "@/features/reports/TopCategoriesCard";
import { BackupCard } from "@/features/backup/BackupCard";
import { useYearTransactions } from "@/hooks/useYearTransactions";
import { useCommitments } from "@/hooks/useCommitments";
import { useCategoryMap } from "@/hooks/useCategories";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Meu Bolso" },
      { name: "description", content: "Gráficos e análises de gastos por categoria e período." },
      { property: "og:title", content: "Relatórios — Meu Bolso" },
      { property: "og:description", content: "Entenda para onde vai o seu dinheiro." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());

  const { incomeByMonth, expenseByMonth, expenseByCategory, hasData, isLoading } =
    useYearTransactions(year);
  const { monthTotals } = useCommitments(year);
  const categories = useCategoryMap();

  const years = [year - 1, year, year + 1];
  const monthCategories = expenseByCategory(monthIndex);

  const handleMonthChange = (nextMonth: number, nextYear: number) => {
    setMonthIndex(nextMonth);
    if (nextYear !== year) setYear(nextYear);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Relatórios ${year}`}
        description="Análises de gastos, evolução do saldo e comparação com o planejado."
        icon={PieChart}
        action={
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl" />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={PieChart}
          title={`Sem dados em ${year} ainda`}
          description="Cadastre receitas e despesas para ver seus gráficos e análises deste ano."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryDonutCard
            data={monthCategories}
            categories={categories}
            monthIndex={monthIndex}
            year={year}
            onMonthChange={handleMonthChange}
          />
          <IncomeExpenseCard incomeByMonth={incomeByMonth} expenseByMonth={expenseByMonth} />
          <PlannedVsActualCard monthTotals={monthTotals} expenseByMonth={expenseByMonth} />
          <TopCategoriesCard data={monthCategories} categories={categories} />
        </div>
      )}

      <BackupCard />
    </div>
  );
}
