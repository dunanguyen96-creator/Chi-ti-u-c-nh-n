export interface Transaction {
  id: string;
  date: string;
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

export interface DebtAccount {
  id: string;
  name: string;
  monthlyInterestRate: number | null;
  yearlyInterestRate: number | null;
  serviceFee: string | null;
  borrowedAmount: number | null;
  remainingAmount: number | null;
  availableLimit: number | null;
  note: string | null;
  interestClosingDay: number | null;
  paymentDay: number | null;
  cashbackPolicy: string | null;
}
