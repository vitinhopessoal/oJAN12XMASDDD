import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateRecord, useUpdateRecord } from "@/hooks/mutations";
import { formatCurrency } from "@/lib/utils";
import { celebrate, crossedMilestone } from "./celebrate";
import type { GoalStats } from "@/hooks/useGoals";
import type { Contribution } from "@/types";

const schema = z.object({
  value: z.number({ message: "Informe um valor" }).positive("O valor deve ser maior que zero"),
  date: z.string().min(10, "Informe a data"),
  note: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const CHEERS = ["🚀", "💪", "✨", "📈"];

interface ContributionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: GoalStats;
  contribution?: Contribution | undefined;
}

export function ContributionFormDialog({
  open,
  onOpenChange,
  stats,
  contribution,
}: ContributionFormDialogProps) {
  const create = useCreateRecord<Record<string, unknown>>("contributions");
  const update = useUpdateRecord<Record<string, unknown>>("contributions");
  const isPending = create.isPending || update.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: 0, date: todayISO(), note: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      contribution
        ? {
            value: contribution.value,
            date: contribution.date.slice(0, 10),
            note: contribution.note ?? "",
          }
        : { value: 0, date: todayISO(), note: "" },
    );
  }, [open, contribution, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const payload: Record<string, unknown> = {
      goal: stats.goal.id,
      value: data.value,
      date: data.date,
      note: data.note?.trim() ?? "",
    };

    if (contribution) {
      await update.mutateAsync({ id: contribution.id, data: payload });
      onOpenChange(false);
      return;
    }

    const before = stats.progressPct;
    await create.mutateAsync(payload);
    onOpenChange(false);

    const target = stats.goal.targetValue;
    const after =
      target > 0 ? Math.min(((stats.investedTotal + data.value) / target) * 100, 100) : 0;
    const milestone = crossedMilestone(before, after);

    if (milestone === 100) {
      void celebrate();
      toast.success(`Meta "${stats.goal.name}" concluída! 🏆`);
    } else if (milestone) {
      void celebrate();
      toast.success(`Marco de ${milestone}% atingido em "${stats.goal.name}"! 🎉`);
    } else {
      const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
      toast.success(
        `Aporte registrado! Você está ${formatCurrency(data.value)} mais perto de ${
          stats.goal.name
        } ${cheer}`,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contribution ? "Editar aporte" : "Novo aporte"}</DialogTitle>
          <DialogDescription>{stats.goal.name}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      inputClassName="h-14 text-2xl font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: rendimento, aporte extra..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar aporte
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
