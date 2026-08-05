import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas — Meu Bolso" },
      { name: "description", content: "Gerencie contas correntes, investimentos e dinheiro em espécie." },
      { property: "og:title", content: "Contas — Meu Bolso" },
      { property: "og:description", content: "Suas contas bancárias e saldos reunidos." },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contas" description="Contas bancárias, investimentos e dinheiro." icon={Landmark} />
      <EmptyState
        icon={Landmark}
        title="Gestão de contas em breve"
        description="Aqui você poderá cadastrar e editar suas contas assim que a persistência estiver ligada."
      />
    </div>
  );
}
