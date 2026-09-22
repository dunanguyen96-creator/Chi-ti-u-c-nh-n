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

export interface CardStatement {
  id: string;
  cardId: string;
  date: string;
  balance: number;
}

export interface CardPayment {
  id: string;
  cardId: string;
  date: string;
  amount: number;
}

export interface CreditCard {
  id: string;
  name: string;
  cardLimit: number | null;
  installmentAmount: number | null;
  installmentTerm: string | null;
  note: string | null;
  statements: CardStatement[];
  payments: CardPayment[];
}
