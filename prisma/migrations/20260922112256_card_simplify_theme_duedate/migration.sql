/*
  Warnings:

  - You are about to drop the column `cardLimit` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `installmentAmount` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `installmentTerm` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `CreditCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardStatement" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CreditCard" DROP COLUMN "cardLimit",
DROP COLUMN "installmentAmount",
DROP COLUMN "installmentTerm",
DROP COLUMN "note";

-- Remove the VCB Pla card (cascades to its statements/payments, if any).
DELETE FROM "CreditCard" WHERE "name" = 'VCB Pla 9823';
