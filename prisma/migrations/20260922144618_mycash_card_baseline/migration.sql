-- Baseline (số gốc) balance for "Mycash thấu chi" (overdraft account),
-- 2026-09: current outstanding balance, same baseline+accumulate pattern
-- as the other cards' CardBaseline rows.
INSERT INTO "CardBaseline" (id, month, card, amount, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, '2026-09', 'Mycash thấu chi', 33271185, now(), now())
ON CONFLICT (month, card) DO UPDATE SET amount = EXCLUDED.amount, "updatedAt" = now();
