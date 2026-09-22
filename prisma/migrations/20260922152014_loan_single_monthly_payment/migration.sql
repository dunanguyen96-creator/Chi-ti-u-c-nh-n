-- Add monthlyPayment nullable first, backfill it from the old columns for
-- any existing rows, then enforce NOT NULL and drop the old columns. Doing
-- it all in one ALTER TABLE (drop + add NOT NULL with no default) fails
-- outright on a non-empty table — this is the safe, data-preserving order.
ALTER TABLE "Loan" ADD COLUMN "monthlyPayment" INTEGER;

UPDATE "Loan" SET "monthlyPayment" = "monthlyInterest" + "monthlyPrincipal";

ALTER TABLE "Loan" ALTER COLUMN "monthlyPayment" SET NOT NULL;

ALTER TABLE "Loan" DROP COLUMN "monthlyInterest";
ALTER TABLE "Loan" DROP COLUMN "monthlyPrincipal";
