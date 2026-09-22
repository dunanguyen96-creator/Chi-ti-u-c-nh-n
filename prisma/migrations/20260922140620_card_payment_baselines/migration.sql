-- CreateTable
CREATE TABLE "CardPaymentBaseline" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "card" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardPaymentBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardPaymentBaseline_month_card_key" ON "CardPaymentBaseline"("month", "card");

-- Baseline (số gốc) card payment totals, from the "Tổng TT thẻ/ tháng"
-- report. New entries in "Lịch sử thanh toán" for the same card/month add
-- on top of these at read time (same pattern as CardBaseline).
INSERT INTO "CardPaymentBaseline" (id, month, card, amount, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, '2026-08', 'Tech 6505', 5882764, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'VPbank 4264', 9128889, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'VCB Sig 0328', 5000000, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Tech 6505', 6740593, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'VPbank 4264', 9566000, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'VCB Sig 0328', 3644238, now(), now());
