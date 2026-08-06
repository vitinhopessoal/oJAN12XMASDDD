export type BankAccountType = "CHECKING" | "INVESTMENT" | "CASH";
export type MovementType = "INCOME" | "EXPENSE";
export type TransactionStatus = "PAID" | "PENDING";
export type Recurrence = "FIXED" | "INSTALLMENT" | "ONCE";

export interface BankAccount {
  id: string;
  name: string;
  type: BankAccountType;
  initialBalance: number;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: MovementType;
}

export interface Transaction {
  id: string;
  name: string;
  value: number;
  date: string;
  type: MovementType;
  status: TransactionStatus;
  bankAccountId: string;
  categoryId: string;
  /** Capturada automaticamente e ainda não revisada. */
  needsReview?: boolean;
  /** Texto cru da notificação do banco. */
  rawText?: string;
}

export interface Commitment {
  id: string;
  name: string;
  color: string;
  value: number;
  startMonth: string;
  recurrence: Recurrence;
  installments?: number;
  categoryId?: string;
  /** Meses já pagos, no formato "YYYY-MM". */
  paidMonths?: string[];
}

export interface InvestmentGoal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetValue: number;
  monthlyPlan: number;
  deadline?: string;
}

export interface Contribution {
  id: string;
  goalId: string;
  value: number;
  date: string;
  note?: string;
}
