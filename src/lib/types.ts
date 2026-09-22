export interface Transaction {
  id: string;
  date: string;
  recordMonth: string;
  description: string;
  category: string;
  card: string | null;
  note: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  month: string;
  amount: number;
  note: string | null;
}

export interface CategoryBaseline {
  id: string;
  month: string;
  category: string;
  amount: number;
}

export interface CardBaseline {
  id: string;
  month: string;
  card: string;
  amount: number;
}

export interface CardPaymentBaseline {
  id: string;
  month: string;
  card: string;
  amount: number;
}

export interface Installment {
  id: string;
  card: string;
  totalAmount: number;
  startMonth: string;
  endMonth: string;
  monthlyAmount: number;
}

export interface Loan {
  id: string;
  description: string;
  loanDate: string;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  paymentDay: number | null;
}

export interface CardStatement {
  id: string;
  cardId: string;
  date: string;
  balance: number;
  dueDate: string | null;
}

export interface CardPayment {
  id: string;
  cardId: string;
  statementId: string | null;
  date: string;
  amount: number;
}

export interface CreditCard {
  id: string;
  name: string;
  creditLimit: number | null;
  statements: CardStatement[];
  payments: CardPayment[];
}
