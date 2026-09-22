/*
  Warnings:

  - You are about to drop the `DebtAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recordMonth` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Income_month_key";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recordMonth" TEXT;

-- Backfill existing rows: default recordMonth to the transaction date's month.
UPDATE "Transaction" SET "recordMonth" = to_char("date", 'YYYY-MM') WHERE "recordMonth" IS NULL;

ALTER TABLE "Transaction" ALTER COLUMN "recordMonth" SET NOT NULL;

-- DropTable
DROP TABLE "DebtAccount";

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cardLimit" INTEGER,
    "installmentAmount" INTEGER,
    "installmentTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardStatement" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "balance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardPayment" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditCard_name_key" ON "CreditCard"("name");

-- CreateIndex
CREATE INDEX "CardStatement_cardId_idx" ON "CardStatement"("cardId");

-- CreateIndex
CREATE INDEX "CardPayment_cardId_idx" ON "CardPayment"("cardId");

-- CreateIndex
CREATE INDEX "Income_month_idx" ON "Income"("month");

-- CreateIndex
CREATE INDEX "Transaction_recordMonth_idx" ON "Transaction"("recordMonth");

-- AddForeignKey
ALTER TABLE "CardStatement" ADD CONSTRAINT "CardStatement_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPayment" ADD CONSTRAINT "CardPayment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CreditCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
