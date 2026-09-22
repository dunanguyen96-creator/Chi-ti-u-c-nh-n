-- CreateTable
CREATE TABLE "CardBaseline" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "card" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardBaseline_month_card_key" ON "CardBaseline"("month", "card");

-- Baseline (số gốc) card spend for 2026-09, from the "Tổng chi bằng thẻ"
-- report. New transactions tagged with the same card/month add on top of
-- these at read time (same pattern as CategoryBaseline).
INSERT INTO "CardBaseline" (id, month, card, amount, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, '2026-09', 'Tech 6505', 7218625, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'VPbank 4264', 4132136, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'VCB Sig 0328', 5467927, now(), now());
