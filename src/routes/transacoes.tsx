import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, SearchX } from "lucide-react";
import { format, isSameDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { MonthSelector } from "@/components/layout/MonthSelector";
import { RowActions } from "@/components/layout/RowActions";
import { TransactionItem } from "@/features/transactions/TransactionItem";
import { TransactionFormDialog } from "@/features/transactions/TransactionFormDialog";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useDeleteRecord, useUpdateRecord } from "@/hooks/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyText } from "@/components/ui/currency-text";
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
import type { Transaction } from "@/types";

export const Route = createFileRoute("/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações — Meu Bolso" },
      {
        name: "description",
        content: "Filtre receitas e despesas por mês, conta, categoria e tipo.",
      },
      { property: "og:title", content: "Transações — Meu Bolso" },
      { property: "og:description", content: "Todas as suas movimentações em um só lugar." },
    ],
  }),
  component: TransactionsPage,
});

function dayLabel(date: Date): string {
  const today = new Date();
  if (isSameDay(date, today)) return "Hoje";
  if (isSameDay(date, subDays(today, 1))) return "Ontem";
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

function TransactionsPage() {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const { transactions, isLoading } = useTransactions(monthKey);
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [accountId, setAccountId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const update = useUpdateRecord<Record<string, unknown>>("transactions");
  const remove = useDeleteRecord("transactions");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (accountId !== "all" && t.bankAccountId !== accountId) return false;
        if (categoryId !== "all" && t.categoryId !== categoryId) return false;
        if (type !== "all" && t.type !== type) return false;
        if (status !== "all" && t.status !== status) return false;
        if (search && !t.name.toLowerCase().includes(search)) return false;
        return true;
      }),
    [transactions, accountId, categoryId, type, status, search],
  );

  const groups = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const map = new Map<string, Transaction[]>();
    for (const t of sorted) {
      const key = t.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return [...map.entries()];
  }, [filtered]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.value, 0);
    const expense = filtered.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.value, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const clearFilters = () => {
    setAccountId("all");
    setCategoryId("all");
    setType("all");
    setStatus("all");
    setSearchInput("");
  };

  const toggleStatus = (t: Transaction) => {
    update.mutate({
      id: t.id,
      data: { status: t.status === "PAID" ? "PENDING" : "PAID" },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Todas as receitas e despesas registradas."
        icon={ArrowLeftRight}
      />

      <MonthSelector
        monthIndex={monthIndex}
        year={year}
        onChange={(m, y) => {
          setMonthIndex(m);
          setYear(y);
        }}
      />

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Buscar por nome..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as contas</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Receitas e despesas</SelectItem>
            <SelectItem value="INCOME">Receitas</SelectItem>
            <SelectItem value="EXPENSE">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PAID">Pagas</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Receitas</p>
          <CurrencyText value={totals.income} className="text-lg font-semibold text-income" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Despesas</p>
          <CurrencyText value={totals.expense} className="text-lg font-semibold text-expense" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saldo do período</p>
          <CurrencyText value={totals.balance} signed className="text-lg font-semibold" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma transação encontrada"
          description="Ajuste os filtros acima para ver outras movimentações."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {groups.map(([day, items]) => (
            <div
              key={day}
              className="rounded-2xl border border-border bg-card px-5 py-2 shadow-soft"
            >
              <p className="pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {dayLabel(new Date(`${day}T12:00:00`))}
              </p>
              {items.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  category={categoryMap[t.categoryId]}
                  account={accountMap[t.bankAccountId]}
                  onClick={() => setEditing(t)}
                  onToggleStatus={() => toggleStatus(t)}
                  actions={
                    <RowActions
                      label={t.name}
                      onEdit={() => setEditing(t)}
                      onDelete={() => setDeleting(t)}
                      extraItems={[
                        {
                          label: t.status === "PAID" ? "Marcar como pendente" : "Marcar como paga",
                          onSelect: () => toggleStatus(t),
                        },
                      ]}
                    />
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <TransactionFormDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          type={editing.type}
          transaction={editing}
        />
      ) : null}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir “{deleting?.name}”? Esta ação não pode ser desfeita.
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
