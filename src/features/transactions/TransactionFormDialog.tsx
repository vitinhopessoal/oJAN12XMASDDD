import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRecord, useUpdateRecord } from "@/hooks/mutations";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { MovementType, Transaction } from "@/types";

const schema = z.object({
  value: z.number({ message: "Informe um valor" }).positive("O valor deve ser maior que zero"),
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres").max(80),
  date: z.date({ message: "Selecione uma data" }),
  bankAccountId: z.string().min(1, "Selecione uma conta"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  paid: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MovementType;
  transaction?: Transaction | undefined;
}

function toPbDate(date: Date): string {
  return `${format(date, "yyyy-MM-dd")} 00:00:00`;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  transaction,
}: TransactionFormDialogProps) {
  const isIncome = type === "INCOME";
  const create = useCreateRecord<Record<string, unknown>>("transactions");
  const update = useUpdateRecord<Record<string, unknown>>("transactions");
  const isPending = create.isPending || update.isPending;

  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const typeCategories = categories.filter((c) => c.type === type);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: 0,
      name: "",
      date: new Date(),
      bankAccountId: "",
      categoryId: "",
      paid: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      transaction
        ? {
            value: transaction.value,
            name: transaction.name,
            date: new Date(transaction.date.replace(" ", "T")),
            bankAccountId: transaction.bankAccountId,
            categoryId: transaction.categoryId,
            paid: transaction.status === "PAID",
          }
        : {
            value: 0,
            name: "",
            date: new Date(),
            bankAccountId: "",
            categoryId: "",
            paid: true,
          },
    );
  }, [open, transaction, form]);

  const onSubmit = (values: FormValues) => {
    const data: Record<string, unknown> = {
      name: values.name,
      value: values.value,
      date: toPbDate(values.date),
      type,
      status: values.paid ? "PAID" : "PENDING",
      bankAccount: values.bankAccountId,
      category: values.categoryId,
    };
    if (transaction) {
      update.mutate({ id: transaction.id, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const accent = isIncome ? "text-income" : "text-expense";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className={accent}>
            {transaction
              ? isIncome
                ? "Editar receita"
                : "Editar despesa"
              : isIncome
                ? "Nova receita"
                : "Nova despesa"}
          </DialogTitle>
          <DialogDescription>
            {isIncome
              ? "Registre um valor que entrou na sua conta."
              : "Registre um valor que saiu da sua conta."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      inputClassName={cn("h-14 text-2xl font-semibold", accent)}
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
                    <Input placeholder="Ex.: Mercado, Salário..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : "Escolha uma data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={field.value}
                        onSelect={(d) => d && field.onChange(d)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: a.color }}
                            />
                            {a.name}
                          </span>
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <CategoryIcon name={c.icon} />
                            {c.name}
                          </span>
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
              name="paid"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
                  <FormLabel className="mb-0">
                    {isIncome ? "Já foi recebido?" : "Já foi pago?"}
                  </FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  isIncome
                    ? "bg-income text-white hover:bg-income/90"
                    : "bg-expense text-white hover:bg-expense/90",
                )}
              >
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
