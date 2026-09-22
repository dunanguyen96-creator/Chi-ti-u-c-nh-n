-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "monthlyInterest" INTEGER NOT NULL,
    "monthlyPrincipal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);
