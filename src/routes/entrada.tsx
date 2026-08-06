import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Inbox, Sparkles } from "lucide-react";
import { format, isSameDay, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyText } from "@/components/ui/currency-text";
import { ReviewDialog } from "@/features/transactions/ReviewDialog";
import { celebrate } from "@/features/goals/celebrate";
import { useInbox } from "@/hooks/useInbox";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/entrada")({
  head: () => ({
    meta: [
      { title: "Caixa de entrada — Meu Bolso" },
      {
        name: "description",
        content: "Revise as compras capturadas automaticamente e organize suas finanças.",
      },
      { property: "og:title", content: "Caixa de entrada — Meu Bolso" },
      {
        property: "og:description",
        content: "Compras capturadas automaticamente esperando a sua revisão.",
      },
    ],
  }),
  component: InboxPage,
});

function whenLabel(raw: string): string {
  const date = new Date(raw.replace(" ", "T"));
  const time = format(date, "HH:mm", { locale: ptBR });
  if (isSameDay(date, new Date())) return `hoje às ${time}`;
  if (isYesterday(date)) return `ontem às ${time}`;
  return `${format(date, "d 'de' MMMM", { locale: ptBR })} às ${time}`;
}

function InboxPage() {
  const { items, count, isLoading } = useInbox();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const startedRef = useRef(false);

  const reviewing: Transaction | undefined = items.find((t) => t.id === reviewingId);
  const index = reviewing ? items.findIndex((t) => t.id === reviewing.id) : -1;

  // Ao esvaziar a caixa depois de revisar, celebra.
  useEffect(() => {
    if (isLoading) return;
    if (count > 0) {
      startedRef.current = true;
      return;
    }
    if (startedRef.current) {
      startedRef.current = false;
      void celebrate();
    }
  }, [count, isLoading]);

  const handleReviewed = () => {
    const remaining = items.filter((t) => t.id !== reviewingId);
    const next = remaining[Math.min(index, remaining.length - 1)];
    setReviewingId(next ? next.id : null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caixa de entrada"
        description="Compras capturadas automaticamente esperando sua revisão."
        icon={Inbox}
        action={
          count > 0 ? (
            <Button onClick={() => setReviewingId(items[0]?.id ?? null)}>
              Revisar todas ({count})
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : count === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Caixa de entrada zerada ✨"
          description="Novas compras no cartão aparecerão aqui automaticamente."
        />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="animate-in fade-in slide-in-from-bottom-1 rounded-2xl border border-border bg-card p-5 shadow-soft transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CurrencyText
                    value={t.value}
                    className="text-2xl font-semibold tabular-nums text-expense"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{whenLabel(t.date)}</p>
                </div>
                <Button size="sm" onClick={() => setReviewingId(t.id)}>
                  Revisar
                </Button>
              </div>
              {t.rawText ? (
                <p className="mt-3 rounded-xl bg-muted px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {t.rawText}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {reviewing ? (
        <ReviewDialog
          open
          onOpenChange={(open) => !open && setReviewingId(null)}
          transaction={reviewing}
          position={index + 1}
          total={count}
          onReviewed={handleReviewed}
        />
      ) : null}
    </div>
  );
}
