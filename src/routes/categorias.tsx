import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Meu Bolso" },
      { name: "description", content: "Organize receitas e despesas por categorias personalizadas." },
      { property: "og:title", content: "Categorias — Meu Bolso" },
      { property: "og:description", content: "Categorias de receitas e despesas do seu orçamento." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Categorias" description="Classifique suas movimentações." icon={Tags} />
      <EmptyState
        icon={Tags}
        title="Categorias em breve"
        description="Você poderá criar, editar e escolher ícones para cada categoria nas próximas etapas."
      />
    </div>
  );
}
