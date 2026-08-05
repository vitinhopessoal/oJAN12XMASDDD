import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Plus, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanningGrid } from "@/features/planning/PlanningGrid";
import { SummaryCard } from "@/features/dashboard/SummaryCard";
import { useCommitments } from "@/hooks/useCommitments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento anual — Meu Bolso" },
      {
        name: "description",
        content:
          "Grade de planejamento anual com gastos fixos, parcelas e totais comprometidos por mês.",
      },
      { property: "og:title", content: "Planejamento anual — Meu Bolso" },
      {
        property: "og:description",
        content: "Veja o quanto está comprometido em cada mês do ano.",
      },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { commitments, matrix, monthTotals, currentMonthTotal, nextMonthTotal, futureAverage } =
    useCommitments(year);

  const years = [year - 1, year, year + 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Planejamento ${year}`}
        description="Gastos fixos, parcelas e compromissos futuros em uma visão anual."
        icon={CalendarRange}
        action={
          <div className="flex items-center gap-2">
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

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Novo compromisso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo compromisso</DialogTitle>
                  <DialogDescription>
                    O formulário será habilitado quando a persistência estiver conectada.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Comprometido este mês"
          value={currentMonthTotal}
          subtitle="de gastos fixos e parcelas"
          icon={CalendarRange}
          tone="pending"
        />
        <SummaryCard
          title="Próximo mês"
          value={nextMonthTotal}
          subtitle="previsto"
          icon={Wallet}
          tone="primary"
        />
        <SummaryCard
          title="Média mensal futura"
          value={futureAverage}
          subtitle="dos meses restantes do ano"
          icon={TrendingUp}
          tone="neutral"
        />
      </div>

      <PlanningGrid
        commitments={commitments}
        matrix={matrix}
        monthTotals={monthTotals}
        year={year}
      />
    </div>
  );
}
