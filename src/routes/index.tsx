import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountCard } from "@/features/accounts/AccountCard";
import { SummaryCard } from "@/features/dashboard/SummaryCard";
import { TransactionItem } from "@/features/transactions/TransactionItem";
import { CurrencyText } from "@/components/ui/currency-text";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useCommitments } from "@/hooks/useCommitments";
import { greeting, MONTHS_LONG } from "@/lib/utils";

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
  const [dialogTitle, setDialogTitle] = useState<string | null>(null);

  const { accounts, totalBalance, isLoading: loadingAccounts } = useAccounts();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const { transactions, monthIncome, monthExpense, isLoading: loadingTx } =
    useTransactions(monthKey);
  const { categories } = useCategories();
  const { currentMonthTotal } = useCommitments(year);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const shiftMonth = (delta: number) => {
    const next = monthIndex + delta;
    if (next < 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else if (next > 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex(next);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting()}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Este é o resumo das suas finanças.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-soft">
          <Button variant="ghost" size="icon" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {MONTHS_LONG[monthIndex]} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={() => shiftMonth(1)} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Receitas do mês" value={monthIncome} icon={ArrowUpCircle} tone="income" />
        <SummaryCard title="Despesas do mês" value={monthExpense} icon={ArrowDownCircle} tone="expense" />
        <SummaryCard
          title="Comprometido este mês"
          value={currentMonthTotal}
          subtitle="de gastos fixos e parcelas"
          icon={CalendarClock}
          tone="pending"
        />
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
          <DropdownMenuItem onSelect={() => setDialogTitle("Nova receita")}>
            <ArrowUpCircle className="h-4 w-4 text-income" /> Nova receita
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialogTitle("Nova despesa")}>
            <ArrowDownCircle className="h-4 w-4 text-expense" /> Nova despesa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogTitle !== null} onOpenChange={(open) => !open && setDialogTitle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle ?? ""}</DialogTitle>
            <DialogDescription>
              O formulário será habilitado quando a persistência estiver conectada.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
