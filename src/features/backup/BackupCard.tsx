import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { pb } from "@/lib/pocketbase";

const COLLECTIONS = ["bank_accounts", "categories", "transactions", "commitments"] as const;

interface BackupFile {
  version: number;
  exportedAt: string;
  bankAccounts: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  commitments: Record<string, unknown>[];
}

function isBackupFile(value: unknown): value is BackupFile {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  if (data["version"] !== 1) return false;
  return ["bankAccounts", "categories", "transactions", "commitments"].every((key) =>
    Array.isArray(data[key]),
  );
}

function stripMeta(record: Record<string, unknown>): Record<string, unknown> {
  const { collectionId, collectionName, expand, created, updated, ...rest } = record;
  void collectionId;
  void collectionName;
  void expand;
  void created;
  void updated;
  return rest;
}

export function BackupCard() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const [bankAccounts, categories, transactions, commitments] = await Promise.all(
        COLLECTIONS.map((name) => pb.collection(name).getFullList()),
      );
      const backup: BackupFile = {
        version: 1,
        exportedAt: new Date().toISOString(),
        bankAccounts: bankAccounts as unknown as Record<string, unknown>[],
        categories: categories as unknown as Record<string, unknown>[],
        transactions: transactions as unknown as Record<string, unknown>[],
        commitments: commitments as unknown as Record<string, unknown>[],
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meu-bolso-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado");
    } catch (error) {
      toast.error(
        `Não foi possível exportar: ${error instanceof Error ? error.message : "erro inesperado"}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) {
        toast.error("Arquivo inválido: não parece um backup do Meu Bolso (versão 1).");
        return;
      }
      setPending(parsed);
    } catch {
      toast.error("Arquivo inválido: não foi possível ler o JSON.");
    }
  };

  const runImport = async (backup: BackupFile) => {
    setBusy(true);
    const toastId = toast.loading("Importando…");
    try {
      for (const name of [...COLLECTIONS].reverse()) {
        const existing = await pb.collection(name).getFullList();
        for (const record of existing) {
          await pb.collection(name).delete(record.id);
        }
      }

      const groups: [string, Record<string, unknown>[]][] = [
        ["bank_accounts", backup.bankAccounts],
        ["categories", backup.categories],
        ["transactions", backup.transactions],
        ["commitments", backup.commitments],
      ];
      for (const [name, records] of groups) {
        for (const record of records) {
          await pb.collection(name).create(stripMeta(record));
        }
      }

      void queryClient.invalidateQueries();
      toast.success("Backup restaurado!", { id: toastId });
    } catch (error) {
      toast.error(
        `Falha ao importar: ${error instanceof Error ? error.message : "erro inesperado"}`,
        { id: toastId },
      );
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Database className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Backup dos dados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guarde seus backups em local seguro. Os dados ficam apenas no seu servidor.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => void handleExport()} disabled={busy}>
          <Download className="h-4 w-4" /> Exportar backup (.json)
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Importar backup
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar backup</AlertDialogTitle>
            <AlertDialogDescription>
              Importar substituirá TODOS os dados atuais ({pending?.bankAccounts.length ?? 0}{" "}
              contas, {pending?.categories.length ?? 0} categorias,{" "}
              {pending?.transactions.length ?? 0} transações, {pending?.commitments.length ?? 0}{" "}
              compromissos). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) void runImport(pending);
              }}
            >
              Importar e substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
