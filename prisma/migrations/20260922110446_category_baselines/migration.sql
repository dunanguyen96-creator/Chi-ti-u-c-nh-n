-- CreateTable
CREATE TABLE "CategoryBaseline" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryBaseline_month_category_key" ON "CategoryBaseline"("month", "category");

-- Reset expense/income entries: replaced by baseline totals from the
-- updated category report + fresh manual entry going forward.
DELETE FROM "Transaction";
DELETE FROM "Income";

-- Baseline (số gốc) expense totals per category per month, from the
-- "báo cáo chi tiêu theo hạng mục" report. New transactions entered for
-- the same category/month add on top of these at read time.
INSERT INTO "CategoryBaseline" (id, month, category, amount, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, '2026-06', 'Son', 9035000, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Son', 11664966, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Son', 12992022, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Son', 6469220, now(), now()),

  (gen_random_uuid()::text, '2026-09', 'Cà phê/ ăn vặt/ ăn sáng...', 1237000, now(), now()),

  (gen_random_uuid()::text, '2026-06', 'Thiết yếu: Thực phẩm/ gia dụng...', 5860000, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Thiết yếu: Thực phẩm/ gia dụng...', 9174748, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Thiết yếu: Thực phẩm/ gia dụng...', 13119812, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Thiết yếu: Thực phẩm/ gia dụng...', 9633754, now(), now()),

  (gen_random_uuid()::text, '2026-05', 'Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao', 6500000, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao', 3783697, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao', 190000, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao', 213500, now(), now()),

  (gen_random_uuid()::text, '2026-06', 'Biếu/ Hiếu/ hỉ/ Quà tặng', 1295000, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Biếu/ Hiếu/ hỉ/ Quà tặng', 5900000, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Biếu/ Hiếu/ hỉ/ Quà tặng', 8323000, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Biếu/ Hiếu/ hỉ/ Quà tặng', 2180000, now(), now()),

  (gen_random_uuid()::text, '2026-06', 'Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...', 3040000, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...', 1067720, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...', 4444600, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...', 3833116, now(), now()),

  (gen_random_uuid()::text, '2026-07', 'Giải trí: đi chơi/ du lịch/ app giải trí', 1993900, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Giải trí: đi chơi/ du lịch/ app giải trí', 572380, now(), now()),

  (gen_random_uuid()::text, '2026-06', 'Học', 4500000, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Học', 236728, now(), now()),

  (gen_random_uuid()::text, '2026-05', 'Trả nợ/ đáo thẻ', 26959913, now(), now()),
  (gen_random_uuid()::text, '2026-06', 'Trả nợ/ đáo thẻ', 22673806, now(), now()),
  (gen_random_uuid()::text, '2026-07', 'Trả nợ/ đáo thẻ', 6963042, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Trả nợ/ đáo thẻ', 7188663, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Trả nợ/ đáo thẻ', 7525179, now(), now()),

  (gen_random_uuid()::text, '2026-06', 'Mèo', 400000, now(), now()),

  (gen_random_uuid()::text, '2026-07', 'Khác', 4664504, now(), now()),
  (gen_random_uuid()::text, '2026-08', 'Khác', 1811412, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Khác', 1258600, now(), now()),

  (gen_random_uuid()::text, '2026-08', 'Công việc', 1567631, now(), now()),
  (gen_random_uuid()::text, '2026-09', 'Công việc', 2239319, now(), now());

-- Baseline (số gốc) income per month, from the same report's INCOME row.
INSERT INTO "Income" (id, month, amount, note, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, '2026-05', 20000000, 'Số gốc', now(), now()),
  (gen_random_uuid()::text, '2026-06', 22000000, 'Số gốc', now(), now()),
  (gen_random_uuid()::text, '2026-07', 22000000, 'Số gốc', now(), now()),
  (gen_random_uuid()::text, '2026-08', 29821739, 'Số gốc', now(), now()),
  (gen_random_uuid()::text, '2026-09', 25498600, 'Số gốc', now(), now());
