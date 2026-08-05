import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { RowActions } from "@/components/layout/RowActions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { AccountCard } from "@/features/accounts/AccountCard";
import { AccountFormDialog } from "@/features/accounts/AccountFormDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useDeleteRecord } from "@/hooks/mutations";
import type { BankAccount } from "@/types";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas — Meu Bolso" },
      {
        name: "description",
        content: "Gerencie contas correntes, investimentos e dinheiro em espécie.",
      },
      { property: "og:title", content: "Contas — Meu Bolso" },
      { property: "og:description", content: "Suas contas bancárias e saldos reunidos." },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { accounts, isLoading } = useAccounts();
  const remove = useDeleteRecord("bank_accounts");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | undefined>(undefined);
  const [toDelete, setToDelete] = useState<BankAccount | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditing(account);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Contas bancárias, investimentos e dinheiro."
        icon={Landmark}
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova conta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhuma conta cadastrada"
          description="Crie sua primeira conta para começar a acompanhar seus saldos."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira conta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              actions={
                <RowActions
                  label={account.name}
                  onEdit={() => openEdit(account)}
                  onDelete={() => setToDelete(account)}
                />
              }
            />
          ))}
        </div>
      )}

      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} account={editing} />

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a conta {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              As transações vinculadas a ela também serão removidas do servidor. Esta ação não pode
              ser desfeita.
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
