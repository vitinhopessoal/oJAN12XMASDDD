import PocketBase, { type RecordModel } from "pocketbase";

import type {
  BankAccount,
  Category,
  Commitment,
  Contribution,
  InvestmentGoal,
  Transaction,
} from "@/types";

export const POCKETBASE_URL =
  (import.meta.env["VITE_POCKETBASE_URL"] as string | undefined) || "http://127.0.0.1:8090";

export const pb = new PocketBase(POCKETBASE_URL);

/** Só consultamos o PocketBase no browser: o servidor local não é acessível no SSR. */
export const isBrowser = typeof window !== "undefined";

export function mapAccount(record: RecordModel): BankAccount {
  return {
    id: record["id"] as string,
    name: (record["name"] as string) ?? "",
    type: ((record["type"] as BankAccount["type"]) ?? "CHECKING"),
    initialBalance: Number(record["initialBalance"] ?? 0),
    color: (record["color"] as string) ?? "#087F5B",
  };
}

export function mapCategory(record: RecordModel): Category {
  return {
    id: record["id"] as string,
    name: (record["name"] as string) ?? "",
    icon: (record["icon"] as string) ?? "circle",
    type: ((record["type"] as Category["type"]) ?? "EXPENSE"),
  };
}

export function mapTransaction(record: RecordModel): Transaction {
  return {
    id: record["id"] as string,
    name: (record["name"] as string) ?? "",
    value: Number(record["value"] ?? 0),
    date: (record["date"] as string) ?? "",
    type: ((record["type"] as Transaction["type"]) ?? "EXPENSE"),
    status: ((record["status"] as Transaction["status"]) ?? "PAID"),
    bankAccountId: (record["bankAccount"] as string) ?? "",
    categoryId: (record["category"] as string) ?? "",
    needsReview: Boolean(record["needsReview"]),
    ...(record["rawText"] ? { rawText: record["rawText"] as string } : {}),
  };
}

export function mapCommitment(record: RecordModel): Commitment {
  const installments = record["installments"];
  const paid = record["paidMonths"];
  const paidMonths = Array.isArray(paid) ? paid.map(String) : [];
  return {
    id: record["id"] as string,
    name: (record["name"] as string) ?? "",
    color: (record["color"] as string) ?? "#087F5B",
    value: Number(record["value"] ?? 0),
    startMonth: (record["startMonth"] as string) ?? "",
    recurrence: ((record["recurrence"] as Commitment["recurrence"]) ?? "FIXED"),
    paidMonths,
    ...(installments ? { installments: Number(installments) } : {}),
    ...(record["category"] ? { categoryId: record["category"] as string } : {}),
  };
}

/** Intervalo (primeiro/último dia) de um mês no formato aceito pelo filtro do PocketBase. */
export function monthRange(month: Date | string): { start: string; end: string } {
  const date =
    typeof month === "string"
      ? new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1)
      : new Date(month.getFullYear(), month.getMonth(), 1);
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date, time: string) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`;
  return { start: fmt(startDate, "00:00:00"), end: fmt(endDate, "23:59:59") };
}

export function monthKeyOf(month: Date | string): string {
  if (typeof month === "string") return month.slice(0, 7);
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

export function mapGoal(record: RecordModel): InvestmentGoal {
  return {
    id: record["id"] as string,
    name: (record["name"] as string) ?? "",
    icon: (record["icon"] as string) ?? "target",
    color: (record["color"] as string) ?? "#087F5B",
    targetValue: Number(record["targetValue"] ?? 0),
    monthlyPlan: Number(record["monthlyPlan"] ?? 0),
    ...(record["deadline"] ? { deadline: record["deadline"] as string } : {}),
  };
}

export function mapContribution(record: RecordModel): Contribution {
  return {
    id: record["id"] as string,
    goalId: (record["goal"] as string) ?? "",
    value: Number(record["value"] ?? 0),
    date: (record["date"] as string) ?? "",
    ...(record["note"] ? { note: record["note"] as string } : {}),
  };
}
