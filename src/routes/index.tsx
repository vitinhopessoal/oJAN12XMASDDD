import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  ChevronRight,
  Inbox,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountCard } from "@/features/accounts/AccountCard";
import { SummaryCard } from "@/features/dashboard/SummaryCard";
import { TransactionItem } from "@/features/transactions/TransactionItem";
import { TransactionFormDialog } from "@/features/transactions/TransactionFormDialog";
import { MonthSelector } from "@/components/layout/MonthSelector";
import { CurrencyText } from "@/components/ui/currency-text";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useCommitments } from "@/hooks/useCommitments";
import { useGoals } from "@/hooks/useGoals";
import { useInbox } from "@/hooks/useInbox";
import { formatCurrency, greeting } from "@/lib/utils";
import type { MovementType } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Bolso — Controle financeiro pessoal" },
      {
        name: "description",
        content:
          "Acompanhe saldos, receitas, despesas e o quanto já está comprometido em cada mês.",
      },
      { property: "og:title", content: "Meu Bolso — Controle financeiro pessoal" },
      {
        property: "og:description",
        content: "Painel simples e bonito para organizar as suas finanças pessoais.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [formType, setFormType] = useState<MovementType | null>(null);

  const { accounts, totalBalance, isLoading: loadingAccounts } = useAccounts();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const {
    transactions,
    monthIncome,
    monthExpense,
    isLoading: loadingTx,
  } = useTransactions(monthKey);
  const { categories } = useCategories();
  const { currentMonthTotal, currentMonthOpen } = useCommitments(year);
  const { count: inboxCount } = useInbox();
  const { totalInvested, contributedThisMonth } = useGoals();

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const pendingExpense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "PENDING")
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting()}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">Este é o resumo das suas finanças.</p>
        </div>
        <MonthSelector
          monthIndex={monthIndex}
          year={year}
          onChange={(m, y) => {
            setMonthIndex(m);
            setYear(y);
          }}
        />
      </div>

      {inboxCount > 0 ? (
        <Link
          to="/entrada"
          className="flex items-center gap-3 rounded-2xl border border-pending/40 bg-pending-soft px-5 py-4 text-sm shadow-soft transition hover:opacity-90"
        >
          <Inbox className="h-5 w-5 shrink-0 text-pending" />
          <span className="flex-1 font-medium">
            Você tem {inboxCount} {inboxCount === 1 ? "compra aguardando" : "compras aguardando"}{" "}
            revisão
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      ) : null}

      <div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-80">Saldo total</p>
        <CurrencyText value={totalBalance} className="mt-2 block text-4xl font-semibold" />
        <p className="mt-2 text-xs opacity-80">Somando todas as suas contas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingAccounts
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-[132px] rounded-2xl" />
            ))
          : accounts.map((a) => <AccountCard key={a.id} account={a} />)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Receitas do mês"
          value={monthIncome}
          icon={ArrowUpCircle}
          tone="income"
        />
        <SummaryCard
          title="Despesas do mês"
          value={monthExpense}
          {...(pendingExpense > 0
            ? { subtitle: `${formatCurrency(pendingExpense)} ainda pendente` }
            : {})}
          icon={ArrowDownCircle}
          tone="expense"
        />
        <SummaryCard
          title="Comprometido este mês"
          value={currentMonthTotal}
          subtitle={
            currentMonthTotal > 0 && currentMonthOpen <= 0
              ? "tudo pago ✓"
              : `${formatCurrency(currentMonthOpen)} ainda em aberto`
          }
          icon={CalendarClock}
          tone="pending"
        />
        <Link to="/investimentos" className="rounded-2xl transition hover:opacity-90">
          <SummaryCard
            title="Investido"
            value={totalInvested}
            subtitle={`${formatCurrency(contributedThisMonth)} aportado este mês`}
            icon={TrendingUp}
            tone="primary"
            className="h-full"
          />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Últimas transações</h2>
        </div>
        {loadingTx
          ? Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="my-3 h-10 rounded-xl" />
            ))
          : null}
        {!loadingTx && transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma transação neste mês.
          </p>
        ) : null}
        {(loadingTx ? [] : transactions.slice(0, 8)).map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            category={categoryMap[t.categoryId]}
            account={accountMap[t.bankAccountId]}
          />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            aria-label="Nova transação"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem onSelect={() => setFormType("INCOME")}>
            <ArrowUpCircle className="h-4 w-4 text-income" /> Nova receita
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFormType("EXPENSE")}>
            <ArrowDownCircle className="h-4 w-4 text-expense" /> Nova despesa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {formType ? (
        <TransactionFormDialog
          open
          onOpenChange={(open) => !open && setFormType(null)}
          type={formType}
        />
      ) : null}
    </div>
  );
}
