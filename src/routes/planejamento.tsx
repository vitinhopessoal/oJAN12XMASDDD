import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Plus, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { RowActions } from "@/components/layout/RowActions";
import { PlanningGrid } from "@/features/planning/PlanningGrid";
import { CommitmentFormDialog } from "@/features/planning/CommitmentFormDialog";
import { SummaryCard } from "@/features/dashboard/SummaryCard";
import { monthKey, useCommitments, useTogglePaidMonth } from "@/hooks/useCommitments";
import { useDeleteRecord } from "@/hooks/mutations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Commitment } from "@/types";

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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Commitment | undefined>(undefined);
  const [deleting, setDeleting] = useState<Commitment | null>(null);

  const {
    commitments,
    matrix,
    paidMatrix,
    monthTotals,
    monthOpenTotals,
    currentMonthTotal,
    currentMonthOpen,
    nextMonthTotal,
    futureAverage,
    isLoading,
  } = useCommitments(year);

  const toggle = useTogglePaidMonth();
  const remove = useDeleteRecord("commitments");

  const years = [year - 1, year, year + 1];

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

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

            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Novo compromisso
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Comprometido este mês"
          value={currentMonthTotal}
          subtitle={
            currentMonthTotal > 0 && currentMonthOpen <= 0
              ? "tudo pago ✓"
              : `${formatCurrency(currentMonthOpen)} em aberto`
          }
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

      {isLoading ? (
        <Skeleton className="h-[320px] rounded-2xl" />
      ) : commitments.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Nenhum compromisso cadastrado"
          description="Cadastre gastos fixos, parcelas e compromissos futuros para ver a sua grade anual."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Criar primeiro compromisso
            </Button>
          }
        />
      ) : (
        <PlanningGrid
          commitments={commitments}
          matrix={matrix}
          paidMatrix={paidMatrix}
          monthTotals={monthTotals}
          monthOpenTotals={monthOpenTotals}
          year={year}
          onToggleMonth={(commitment, m) =>
            toggle.mutate({ commitment, month: monthKey(year, m) })
          }
          renderActions={(commitment) => (
            <RowActions
              label={commitment.name}
              onEdit={() => {
                setEditing(commitment);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(commitment)}
            />
          )}
        />
      )}

      <CommitmentFormDialog open={formOpen} onOpenChange={setFormOpen} commitment={editing} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir o compromisso {deleting?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
