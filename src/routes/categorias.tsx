import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Tags } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { RowActions } from "@/components/layout/RowActions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIcon } from "@/components/ui/category-icon";
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
import { CategoryFormDialog } from "@/features/categories/CategoryFormDialog";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteRecord } from "@/hooks/mutations";
import type { Category, MovementType } from "@/types";

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
  const { categories, isLoading } = useCategories();
  const remove = useDeleteRecord("categories");
  const [tab, setTab] = useState<MovementType>("EXPENSE");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Category | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const list = (type: MovementType) => categories.filter((c) => c.type === type);

  const renderList = (type: MovementType) => {
    if (isLoading) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      );
    }
    const items = list(type);
    if (items.length === 0) {
      return (
        <EmptyState
          icon={Tags}
          title={type === "EXPENSE" ? "Nenhuma categoria de despesa" : "Nenhuma categoria de receita"}
          description="Crie categorias para classificar suas movimentações."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova categoria
            </Button>
          }
        />
      );
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CategoryIcon name={category.icon} className="h-5 w-5" />
            </span>
            <p className="flex-1 truncate text-sm font-medium">{category.name}</p>
            <RowActions
              label={category.name}
              onEdit={() => {
                setEditing(category);
                setFormOpen(true);
              }}
              onDelete={() => setToDelete(category)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Classifique suas movimentações."
        icon={Tags}
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as MovementType)}>
        <TabsList>
          <TabsTrigger value="EXPENSE">Despesas</TabsTrigger>
          <TabsTrigger value="INCOME">Receitas</TabsTrigger>
        </TabsList>
        <TabsContent value="EXPENSE" className="mt-4">
          {renderList("EXPENSE")}
        </TabsContent>
        <TabsContent value="INCOME" className="mt-4">
          {renderList("INCOME")}
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        defaultType={tab}
      />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a categoria {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Transações que usam esta categoria ficarão sem categoria. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!toDelete) return;
                remove.mutate(toDelete.id, { onSuccess: () => setToDelete(undefined) });
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
