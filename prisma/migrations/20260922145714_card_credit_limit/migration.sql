-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "creditLimit" INTEGER;

-- Mycash thấu chi is an overdraft account with a fixed credit limit,
-- not a statement-cycle credit card.
UPDATE "CreditCard" SET "creditLimit" = 45000000 WHERE name = 'Mycash thấu chi';
