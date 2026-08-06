import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ColorSwatches, COLOR_PALETTE } from "@/components/ui/color-swatches";
import { IconPicker } from "@/components/ui/icon-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRecord, useUpdateRecord } from "@/hooks/mutations";
import { formatCurrency, MONTHS_LONG } from "@/lib/utils";
import { currentMonthKey, monthAbbrLabel } from "./celebrate";
import type { InvestmentGoal } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres").max(60),
  icon: z.string().min(1, "Selecione um ícone"),
  color: z.string().min(4, "Selecione uma cor"),
  targetValue: z
    .number({ message: "Informe o valor da meta" })
    .positive("O valor deve ser maior que zero"),
  monthlyPlan: z.number().min(0, "Valor inválido"),
  deadline: z.string(),
});

type FormValues = z.infer<typeof schema>;

const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i - 1);

export interface GoalPreset {
  name: string;
  icon: string;
  color: string;
  targetValue: number;
  monthlyPlan: number;
}

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: InvestmentGoal | undefined;
  preset?: GoalPreset | undefined;
}

function emptyValues(): FormValues {
  return {
    name: "",
    icon: "target",
    color: COLOR_PALETTE[2] as string,
    targetValue: 0,
    monthlyPlan: 0,
    deadline: "",
  };
}

export function GoalFormDialog({ open, onOpenChange, goal, preset }: GoalFormDialogProps) {
  const create = useCreateRecord<Record<string, unknown>>("investment_goals");
  const update = useUpdateRecord<Record<string, unknown>>("investment_goals");
  const isPending = create.isPending || update.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    if (goal) {
      form.reset({
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        targetValue: goal.targetValue,
        monthlyPlan: goal.monthlyPlan,
        deadline: goal.deadline ?? "",
      });
    } else if (preset) {
      form.reset({ ...emptyValues(), ...preset });
    } else {
      form.reset(emptyValues());
    }
  }, [open, goal, preset, form]);

  const values = form.watch();
  const [deadlineYear, deadlineMonth] = values.deadline
    ? values.deadline.split("-")
    : ["", ""];

  let summary = "Informe o valor da meta e o aporte mensal para ver a projeção.";
  if (values.targetValue > 0 && values.monthlyPlan > 0) {
    const months = Math.ceil(values.targetValue / values.monthlyPlan);
    const end = new Date();
    end.setDate(1);
    end.setMonth(end.getMonth() + months);
    summary = `${formatCurrency(values.monthlyPlan)}/mês → conclui em ~${months} ${
      months === 1 ? "mês" : "meses"
    } (${monthAbbrLabel(end)})`;
  }

  const onSubmit = form.handleSubmit(async (data) => {
    const payload: Record<string, unknown> = {
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
      targetValue: data.targetValue,
      monthlyPlan: data.monthlyPlan,
      deadline: data.deadline,
    };
    if (goal) {
      await update.mutateAsync({ id: goal.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  });

  const setDeadlinePart = (part: "month" | "year", value: string) => {
    const base = values.deadline || currentMonthKey();
    const [y, m] = base.split("-");
    const next = part === "month" ? `${y}-${value}` : `${value}-${m}`;
    form.setValue("deadline", next, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{goal ? "Editar meta" : "Nova meta de investimento"}</DialogTitle>
          <DialogDescription>
            Defina quanto quer juntar e o quanto pretende aportar por mês.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da meta</FormLabel>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Reserva de emergência, Comprar um carro..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quanto pretende aportar por mês?</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Quero concluir até (opcional)</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={deadlineMonth ?? ""}
                  onValueChange={(v) => setDeadlinePart("month", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_LONG.map((label, index) => (
                      <SelectItem key={label} value={String(index + 1).padStart(2, "0")}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={deadlineYear ?? ""}
                  onValueChange={(v) => setDeadlinePart("year", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {values.deadline ? (
                <FormDescription>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => form.setValue("deadline", "")}
                  >
                    Remover prazo
                  </button>
                </FormDescription>
              ) : null}
            </FormItem>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <ColorSwatches value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              {summary}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {goal ? "Salvar" : "Criar meta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
