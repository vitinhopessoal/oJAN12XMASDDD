import type { BankAccount, Category, Commitment, Transaction } from "@/types";

// MOCK: será substituído pelo PocketBase.
export const mockAccounts: BankAccount[] = [
  { id: "acc-1", name: "Nubank", type: "CHECKING", initialBalance: 4820.35, color: "#820AD1" },
  { id: "acc-2", name: "Itaú", type: "INVESTMENT", initialBalance: 12750.9, color: "#EC7000" },
  { id: "acc-3", name: "Carteira", type: "CASH", initialBalance: 320, color: "#087F5B" },
];

// MOCK: será substituído pelo PocketBase.
export const mockCategories: Category[] = [
  { id: "cat-1", name: "Salário", icon: "Wallet", type: "INCOME" },
  { id: "cat-2", name: "Freelance", icon: "Laptop", type: "INCOME" },
  { id: "cat-3", name: "Mercado", icon: "ShoppingCart", type: "EXPENSE" },
  { id: "cat-4", name: "Transporte", icon: "Car", type: "EXPENSE" },
  { id: "cat-5", name: "Moradia", icon: "Home", type: "EXPENSE" },
  { id: "cat-6", name: "Lazer", icon: "Popcorn", type: "EXPENSE" },
  { id: "cat-7", name: "Saúde", icon: "HeartPulse", type: "EXPENSE" },
  { id: "cat-8", name: "Assinaturas", icon: "Repeat", type: "EXPENSE" },
];

const now = new Date();
const iso = (day: number) =>
  new Date(now.getFullYear(), now.getMonth(), day).toISOString();

// MOCK: será substituído pelo PocketBase.
export const mockTransactions: Transaction[] = [
  { id: "t-1", name: "Salário", value: 7800, date: iso(5), type: "INCOME", status: "PAID", bankAccountId: "acc-1", categoryId: "cat-1" },
  { id: "t-2", name: "Aluguel", value: 2100, date: iso(6), type: "EXPENSE", status: "PAID", bankAccountId: "acc-1", categoryId: "cat-5" },
  { id: "t-3", name: "Mercado do mês", value: 843.27, date: iso(7), type: "EXPENSE", status: "PAID", bankAccountId: "acc-1", categoryId: "cat-3" },
  { id: "t-4", name: "Projeto landing page", value: 1500, date: iso(9), type: "INCOME", status: "PENDING", bankAccountId: "acc-2", categoryId: "cat-2" },
  { id: "t-5", name: "Uber", value: 38.9, date: iso(11), type: "EXPENSE", status: "PAID", bankAccountId: "acc-3", categoryId: "cat-4" },
  { id: "t-6", name: "Spotify", value: 12.9, date: iso(12), type: "EXPENSE", status: "PAID", bankAccountId: "acc-1", categoryId: "cat-8" },
  { id: "t-7", name: "Cinema", value: 64, date: iso(14), type: "EXPENSE", status: "PENDING", bankAccountId: "acc-3", categoryId: "cat-6" },
  { id: "t-8", name: "Farmácia", value: 122.4, date: iso(15), type: "EXPENSE", status: "PAID", bankAccountId: "acc-1", categoryId: "cat-7" },
  { id: "t-9", name: "Totalpass", value: 109.9, date: iso(16), type: "EXPENSE", status: "PENDING", bankAccountId: "acc-1", categoryId: "cat-8" },
  { id: "t-10", name: "Internet", value: 50, date: iso(18), type: "EXPENSE", status: "PENDING", bankAccountId: "acc-1", categoryId: "cat-5" },
];

const year = now.getFullYear();
const m = (month: number) => `${year}-${String(month).padStart(2, "0")}`;

// MOCK: será substituído pelo PocketBase.
export const mockCommitments: Commitment[] = [
  { id: "c-1", name: "Totalpass", color: "#087F5B", value: 109.9, startMonth: m(1), recurrence: "FIXED", categoryId: "cat-8" },
  { id: "c-2", name: "Spotify", color: "#1DB954", value: 12.9, startMonth: m(1), recurrence: "FIXED", categoryId: "cat-8" },
  { id: "c-3", name: "Celular", color: "#7048E8", value: 135.7, startMonth: m(1), recurrence: "FIXED", categoryId: "cat-8" },
  { id: "c-4", name: "Internet", color: "#1C7ED6", value: 50, startMonth: m(1), recurrence: "FIXED", categoryId: "cat-5" },
  { id: "c-5", name: "Aluguel", color: "#E8590C", value: 2100, startMonth: m(1), recurrence: "FIXED", categoryId: "cat-5" },
  { id: "c-6", name: "Academia", color: "#D6336C", value: 89.9, startMonth: m(3), recurrence: "FIXED", categoryId: "cat-7" },
  { id: "c-7", name: "PS5", color: "#0B7285", value: 116.66, startMonth: m(Math.max(1, now.getMonth() - 1)), recurrence: "INSTALLMENT", installments: 3, categoryId: "cat-6" },
  { id: "c-8", name: "Curso de inglês", color: "#5C940D", value: 75, startMonth: m(now.getMonth() + 1), recurrence: "INSTALLMENT", installments: 2, categoryId: "cat-6" },
  { id: "c-9", name: "Notebook", color: "#495057", value: 416.5, startMonth: m(2), recurrence: "INSTALLMENT", installments: 10, categoryId: "cat-6" },
  { id: "c-10", name: "Seguro do carro", color: "#F08C00", value: 1240, startMonth: m(8), recurrence: "ONCE", categoryId: "cat-4" },
  { id: "c-11", name: "IPTU", color: "#AE3EC9", value: 680, startMonth: m(2), recurrence: "ONCE", categoryId: "cat-5" },
  { id: "c-12", name: "Viagem de fim de ano", color: "#2F9E44", value: 2500, startMonth: m(12), recurrence: "ONCE", categoryId: "cat-6" },
];
