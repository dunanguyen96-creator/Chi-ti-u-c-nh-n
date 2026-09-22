-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "paymentDueDay" INTEGER,
ADD COLUMN     "statementClosingDay" INTEGER;

-- Rename cards to include last-4-digits / new naming, and carry the rename
-- over to any transaction already tagged with the old card name.
UPDATE "Transaction" SET "card" = 'Tech 6505' WHERE "card" = 'Tech';
UPDATE "CreditCard" SET "name" = 'Tech 6505' WHERE "name" = 'Tech';

UPDATE "Transaction" SET "card" = 'VPbank 4264' WHERE "card" = 'VPbank';
UPDATE "CreditCard" SET "name" = 'VPbank 4264' WHERE "name" = 'VPbank';

UPDATE "Transaction" SET "card" = 'VCB Sig 0328' WHERE "card" = 'VCB Sig';
UPDATE "CreditCard" SET "name" = 'VCB Sig 0328' WHERE "name" = 'VCB Sig';

UPDATE "Transaction" SET "card" = 'VCB Pla 9823' WHERE "card" = 'VCB Pla';
UPDATE "CreditCard" SET "name" = 'VCB Pla 9823' WHERE "name" = 'VCB Pla';

UPDATE "Transaction" SET "card" = 'Mycash thấu chi' WHERE "card" = 'My Cash Tech';
UPDATE "CreditCard" SET "name" = 'Mycash thấu chi' WHERE "name" = 'My Cash Tech';

-- Example statement-closing/payment days as given for Tech 6505.
UPDATE "CreditCard" SET "statementClosingDay" = 22, "paymentDueDay" = 5 WHERE "name" = 'Tech 6505';
