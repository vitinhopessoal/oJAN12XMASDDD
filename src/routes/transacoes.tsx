import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight, SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { TransactionItem } from "@/features/transactions/TransactionItem";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { MONTHS_LONG } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function TransactionsPage() {
  const { transactions, isLoading } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [month, setMonth] = useState(String(new Date().getMonth()));
  const [accountId, setAccountId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        if (month !== "all" && d.getMonth() !== Number(month)) return false;
        if (accountId !== "all" && t.bankAccountId !== accountId) return false;
        if (categoryId !== "all" && t.categoryId !== categoryId) return false;
        if (type !== "all" && t.type !== type) return false;
        return true;
      }),
    [transactions, month, accountId, categoryId, type],
  );

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Todas as receitas e despesas registradas."
        icon={ArrowLeftRight}
      />

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {MONTHS_LONG.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma transação encontrada"
          description="Ajuste os filtros acima para ver outras movimentações."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card px-5 py-2 shadow-soft">
          {filtered.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              category={categoryMap[t.categoryId]}
              account={accountMap[t.bankAccountId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
