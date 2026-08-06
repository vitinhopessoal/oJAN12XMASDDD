import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, CalendarClock, Loader2, Repeat } from "lucide-react";

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
import { ColorSwatches, COLOR_PALETTE } from "@/components/ui/color-swatches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRecord, useUpdateRecord } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import { cn, formatCurrency, MONTHS_LONG, parseMonthKey } from "@/lib/utils";
import type { Commitment, Recurrence } from "@/types";

const schema = z
  .object({
    name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres").max(60),
    value: z.number({ message: "Informe um valor" }).positive("O valor deve ser maior que zero"),
    color: z.string().min(4, "Selecione uma cor"),
    startMonth: z.string().regex(/^\d{4}-\d{2}$/, "Selecione o mês inicial"),
    recurrence: z.enum(["FIXED", "INSTALLMENT", "ONCE"], { message: "Selecione a recorrência" }),
    installments: z.number().int().min(2, "Mínimo de 2 parcelas").max(120, "Máximo de 120 parcelas").optional(),
    categoryId: z.string(),
  })
  .refine((v) => v.recurrence !== "INSTALLMENT" || typeof v.installments === "number", {
    message: "Informe o número de parcelas",
    path: ["installments"],
  });

type FormValues = z.infer<typeof schema>;

const YEARS = Array.from({ length: 9 }, (_, i) => 2024 + i);
const MONTHS_ABBR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const RECURRENCE_OPTIONS: {
  value: Recurrence;
  label: string;
  hint: string;
  icon: typeof Repeat;
}[] = [
  { value: "FIXED", label: "Fixo", hint: "repete todo mês, sem data de fim", icon: Repeat },
  {
    value: "INSTALLMENT",
    label: "Parcelado",
    hint: "número definido de parcelas",
    icon: CalendarClock,
  },
  { value: "ONCE", label: "Único", hint: "acontece uma vez", icon: CalendarCheck },
];

function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS_ABBR[month] ?? "?"}/${year}`;
}

function addMonths(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const date = new Date(year, month + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface CommitmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commitment?: Commitment | undefined;
}

export function CommitmentFormDialog({
  open,
  onOpenChange,
  commitment,
}: CommitmentFormDialogProps) {
  const create = useCreateRecord<Record<string, unknown>>("commitments");
  const update = useUpdateRecord<Record<string, unknown>>("commitments");
  const { categories } = useCategories();
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const isPending = create.isPending || update.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      value: 0,
      color: COLOR_PALETTE[0] as string,
      startMonth: currentMonthKey(),
      recurrence: "FIXED",
      installments: 2,
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      commitment
        ? {
            name: commitment.name,
            value: commitment.value,
            color: commitment.color,
            startMonth: commitment.startMonth || currentMonthKey(),
            recurrence: commitment.recurrence,
            installments: commitment.installments ?? 2,
            categoryId: commitment.categoryId ?? "",
          }
        : {
            name: "",
            value: 0,
            color: COLOR_PALETTE[0] as string,
            startMonth: currentMonthKey(),
            recurrence: "FIXED",
            installments: 2,
            categoryId: "",
          },
    );
  }, [open, commitment, form]);

  const values = form.watch();
  const start = values.startMonth || currentMonthKey();

  let summary = "";
  if (values.recurrence === "FIXED") {
    summary = `${formatCurrency(values.value || 0)}/mês a partir de ${monthLabel(start)}`;
  } else if (values.recurrence === "ONCE") {
    summary = `${formatCurrency(values.value || 0)} em ${monthLabel(start)}`;
  } else {
    const n = values.installments ?? 2;
    summary = `${n}x de ${formatCurrency(values.value || 0)} (${monthLabel(start)} a ${monthLabel(
      addMonths(start, n - 1),
    )}) — total ${formatCurrency((values.value || 0) * n)}`;
  }

  const onSubmit = (v: FormValues) => {
    const data: Record<string, unknown> = {
      name: v.name,
      value: v.value,
      color: v.color,
      startMonth: v.startMonth,
      recurrence: v.recurrence,
      installments: v.recurrence === "INSTALLMENT" ? (v.installments ?? 2) : null,
      category: v.categoryId || null,
    };
    if (commitment) {
      update.mutate({ id: commitment.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate({ ...data, paidMonths: [] }, { onSuccess: () => onOpenChange(false) });
    }
  };

  const startYear = parseMonthKey(start).year;
  const startMonthIndex = parseMonthKey(start).month;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{commitment ? "Editar compromisso" : "Novo compromisso"}</DialogTitle>
          <DialogDescription>
            Gastos fixos, parcelas e compromissos futuros do seu planejamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por mês</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
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
                    <Input placeholder="Ex.: Spotify, Parcela do celular..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recorrência</FormLabel>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {RECURRENCE_OPTIONS.map((option) => {
                      const selected = field.value === option.value;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-xl border border-border bg-card p-3 text-left transition hover:bg-accent",
                            selected && "border-primary bg-primary-soft",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              selected ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          <span className="mt-2 block text-sm font-medium">{option.label}</span>
                          <span className="block text-[11px] leading-tight text-muted-foreground">
                            {option.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {values.recurrence === "INSTALLMENT" ? (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        max={120}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="startMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês inicial</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={String(startMonthIndex)}
                      onValueChange={(m) =>
                        field.onChange(`${startYear}-${String(Number(m) + 1).padStart(2, "0")}`)
                      }
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Mês inicial">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS_LONG.map((m, i) => (
                          <SelectItem key={m} value={String(i)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(startYear)}
                      onValueChange={(y) =>
                        field.onChange(`${y}-${String(startMonthIndex + 1).padStart(2, "0")}`)
                      }
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Ano inicial">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (opcional)</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {expenseCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              {summary}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
