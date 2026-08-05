import { createFileRoute } from "@tanstack/react-router";
import { PieChart } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";

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
  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Análises de gastos e evolução do saldo." icon={PieChart} />
      <EmptyState
        icon={PieChart}
        title="Relatórios em breve"
        description="Gráficos por categoria, evolução mensal e comparativos aparecerão aqui."
      />
    </div>
  );
}
