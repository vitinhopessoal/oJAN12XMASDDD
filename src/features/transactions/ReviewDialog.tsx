import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteRecord, useUpdateRecord } from "@/hooks/mutations";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import type { MovementType, Transaction } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o que foi essa compra").max(80),
  value: z.number({ message: "Informe um valor" }).positive("O valor deve ser maior que zero"),
  date: z.date({ message: "Selecione uma data" }),
  type: z.enum(["INCOME", "EXPENSE"]),
  bankAccountId: z.string().min(1, "Selecione uma conta"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
});

type FormValues = z.infer<typeof schema>;

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  /** Posição na fila, ex.: 3 de 5. */
  position: number;
  total: number;
  onReviewed: () => void;
}

function toPbDate(date: Date): string {
  return `${format(date, "yyyy-MM-dd HH:mm:ss")}`;
}

export function ReviewDialog({
  open,
  onOpenChange,
  transaction,
  position,
  total,
  onReviewed,
}: ReviewDialogProps) {
  const update = useUpdateRecord<Record<string, unknown>>("transactions");
  const remove = useDeleteRecord("transactions");
  const isPending = update.isPending || remove.isPending;

  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      value: transaction.value,
      date: new Date(),
      type: transaction.type,
      bankAccountId: "",
      categoryId: "",
    },
  });

  const type = form.watch("type") as MovementType;
  const typeCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    form.reset({
      name: transaction.name ?? "",
      value: transaction.value,
      date: new Date(transaction.date.replace(" ", "T")),
      type: transaction.type,
      bankAccountId: transaction.bankAccountId || "",
      categoryId: transaction.categoryId || "",
    });
  }, [transaction, form]);

  const onSubmit = (values: FormValues) => {
    update.mutate(
      {
        id: transaction.id,
        data: {
          name: values.name,
          value: values.value,
          date: toPbDate(values.date),
          type: values.type,
          bankAccount: values.bankAccountId,
          category: values.categoryId,
          needsReview: false,
        },
      },
      {
        onSuccess: () => {
          toast.success("Organizado! 🎉");
          onReviewed();
        },
      },
    );
  };

  const discard = () => {
    remove.mutate(transaction.id, { onSuccess: () => onReviewed() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-md overflow-y-auto rounded-2xl bottom-0 top-auto translate-y-0 rounded-b-none data-[state=open]:slide-in-from-bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            Revisar compra{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {position} de {total}
            </span>
          </DialogTitle>
          <DialogDescription>Complete os dados para organizar essa transação.</DialogDescription>
        </DialogHeader>

        {transaction.rawText ? (
          <p className="rounded-xl bg-muted px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {transaction.rawText}
          </p>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que foi essa compra?</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="Ex.: tangerinas na feira"
                      className="h-12 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      inputClassName={cn(
                        "h-12 text-xl font-semibold",
                        type === "INCOME" ? "text-income" : "text-expense",
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
                            {format(field.value, "dd/MM/yyyy", { locale: ptBR })}
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
                          className="pointer-events-auto p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("categoryId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                        <SelectItem value="INCOME">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" className="text-expense">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Não foi minha / descartar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Descartar compra</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esse registro será excluído definitivamente. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={discard}>Descartar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
