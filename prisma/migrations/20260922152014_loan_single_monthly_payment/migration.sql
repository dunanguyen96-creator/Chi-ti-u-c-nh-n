/*
  Warnings:

  - You are about to drop the column `monthlyInterest` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyPrincipal` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `monthlyPayment` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "monthlyInterest",
DROP COLUMN "monthlyPrincipal",
ADD COLUMN     "monthlyPayment" INTEGER NOT NULL;
