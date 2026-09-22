/*
  Warnings:

  - You are about to drop the column `paymentDueDay` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `statementClosingDay` on the `CreditCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN "note" TEXT;

-- Carry over any existing statement-closing/payment-due day into the new
-- free-text note field before dropping the old numeric columns.
UPDATE "CreditCard"
SET "note" = CONCAT_WS(', ',
  CASE WHEN "statementClosingDay" IS NOT NULL THEN 'Chốt sao kê ngày ' || "statementClosingDay" || ' hàng tháng' END,
  CASE WHEN "paymentDueDay" IS NOT NULL THEN 'Thanh toán ngày ' || "paymentDueDay" || ' hàng tháng' END
)
WHERE "statementClosingDay" IS NOT NULL OR "paymentDueDay" IS NOT NULL;

ALTER TABLE "CreditCard" DROP COLUMN "paymentDueDay",
DROP COLUMN "statementClosingDay";
