const THIET_YEU = "Thiết yếu: Thực phẩm/ gia dụng/ công việc...";
const CA_NHAN = "Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...";
const SUC_KHOE = "Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao";
const BIEU = "Biếu/ Hiếu/ hỉ/ Quà tặng";
const GIAI_TRI = "Giải trí: đi chơi/ du lịch/ app giải trí";
const HOC = "Học";
const TRA_NO = "Trả nợ/ đáo thẻ";
const MEO = "Mèo";
const SON = "Son";

export interface SeedTransaction {
  date: string;
  description: string;
  category: string;
  card: string | null;
  note: string | null;
  amount: number;
}

// Imported from the original Google Sheet (bảng chi tiêu).
export const SEED_TRANSACTIONS: SeedTransaction[] = [
  { date: "2026-06-30", description: "Sữa Son", category: SON, card: null, note: null, amount: 5625000 },
  { date: "2026-06-30", description: "Bún cá", category: THIET_YEU, card: null, note: null, amount: 100000 },
  { date: "2026-06-30", description: "Trứng gà", category: THIET_YEU, card: null, note: null, amount: 120000 },
  { date: "2026-07-01", description: "Đáo thẻ vcb", category: TRA_NO, card: null, note: null, amount: 1633000 },
  { date: "2026-07-01", description: "TT thẻ vcb", category: TRA_NO, card: null, note: null, amount: 439970 },
  { date: "2026-07-01", description: "Cơm gà", category: THIET_YEU, card: null, note: null, amount: 55000 },
  { date: "2026-07-01", description: "Gia hạn apple + gg", category: THIET_YEU, card: null, note: null, amount: 300000 },
  { date: "2026-06-30", description: "Tắm son", category: SON, card: null, note: null, amount: 100000 },
  { date: "2026-07-01", description: "thịt lợn", category: THIET_YEU, card: null, note: null, amount: 280000 },
  { date: "2026-07-01", description: "cháo Son", category: SON, card: null, note: null, amount: 375000 },
  { date: "2026-06-30", description: "cháo Son", category: SON, card: null, note: "Tổng T6", amount: 1425000 },
  { date: "2026-06-30", description: "thịt lợn", category: THIET_YEU, card: null, note: "Tổng T6", amount: 475000 },
  { date: "2026-06-29", description: "thịt bò", category: THIET_YEU, card: null, note: "Tổng T6", amount: 715000 },
  { date: "2026-06-29", description: "bảo hiểm bà", category: BIEU, card: null, note: null, amount: 1000000 },
  { date: "2026-06-28", description: "Sữa Son", category: SON, card: null, note: null, amount: 1645000 },
  { date: "2026-06-28", description: "Ăn vặt", category: THIET_YEU, card: null, note: null, amount: 95000 },
  { date: "2026-06-28", description: "nails", category: CA_NHAN, card: null, note: null, amount: 240000 },
  { date: "2026-06-27", description: "matcha", category: THIET_YEU, card: null, note: null, amount: 115000 },
  { date: "2026-06-27", description: "bánh", category: THIET_YEU, card: null, note: null, amount: 505000 },
  { date: "2026-06-26", description: "gội đầu", category: CA_NHAN, card: null, note: null, amount: 270000 },
  { date: "2026-06-25", description: "bánh c nhung", category: BIEU, card: null, note: null, amount: 295000 },
  { date: "2026-06-24", description: "đồ hàn", category: CA_NHAN, card: null, note: null, amount: 1200000 },
  { date: "2026-06-24", description: "Hoa", category: THIET_YEU, card: null, note: null, amount: 90000 },
  { date: "2026-06-24", description: "Sữa Son", category: SON, card: null, note: null, amount: 1390000 },
  { date: "2026-06-23", description: "od áo messi", category: SON, card: null, note: "cọc", amount: 700000 },
  { date: "2026-06-22", description: "gội đầu", category: CA_NHAN, card: null, note: null, amount: 100000 },
  { date: "2026-06-22", description: "chè na", category: THIET_YEU, card: null, note: null, amount: 145000 },
  { date: "2026-06-05", description: "học makeup", category: HOC, card: null, note: null, amount: 4500000 },
  { date: "2026-06-09", description: "Thẻ vpbank", category: TRA_NO, card: null, note: null, amount: 9170000 },
  { date: "2026-06-09", description: "quần áo", category: THIET_YEU, card: null, note: null, amount: 609000 },
  { date: "2026-06-10", description: "Bún cá", category: THIET_YEU, card: null, note: null, amount: 180000 },
  { date: "2026-06-20", description: "Hoa", category: THIET_YEU, card: null, note: null, amount: 220000 },
  { date: "2026-06-20", description: "là trà", category: THIET_YEU, card: null, note: null, amount: 91000 },
  { date: "2026-06-20", description: "thuốc nhiệt", category: THIET_YEU, card: null, note: null, amount: 36000 },
  { date: "2026-06-17", description: "ăn", category: THIET_YEU, card: null, note: null, amount: 169000 },
  { date: "2026-06-16", description: "tắm& tiêm mèo", category: MEO, card: null, note: null, amount: 400000 },
  { date: "2026-06-16", description: "Sữa Son", category: SON, card: null, note: null, amount: 1835000 },
  { date: "2026-06-16", description: "Ăn", category: THIET_YEU, card: null, note: null, amount: 80000 },
  { date: "2026-06-16", description: "Hoa", category: THIET_YEU, card: null, note: null, amount: 130000 },
  { date: "2026-06-15", description: "Ăn", category: THIET_YEU, card: null, note: null, amount: 105000 },
  { date: "2026-06-15", description: "Vay vpbank", category: TRA_NO, card: null, note: null, amount: 3877876 },
  { date: "2026-06-11", description: "Ăn", category: THIET_YEU, card: null, note: null, amount: 130000 },
  { date: "2026-06-11", description: "Ăn", category: THIET_YEU, card: null, note: null, amount: 110000 },
  { date: "2026-06-05", description: "Thẻ Tech", category: TRA_NO, card: null, note: null, amount: 15545913 },
  { date: "2026-06-08", description: "ăn", category: THIET_YEU, card: null, note: null, amount: 105000 },
  { date: "2026-06-07", description: "Sữa Son", category: SON, card: null, note: null, amount: 1370000 },
  { date: "2026-06-07", description: "Trà sữa", category: THIET_YEU, card: null, note: null, amount: 50000 },
  { date: "2026-06-07", description: "nails", category: CA_NHAN, card: null, note: null, amount: 210000 },
  { date: "2026-06-06", description: "Hipp đức Son", category: SON, card: null, note: null, amount: 570000 },
  { date: "2026-06-05", description: "Trà sữa", category: THIET_YEU, card: null, note: null, amount: 50000 },
  { date: "2026-06-04", description: "Trứng", category: THIET_YEU, card: null, note: null, amount: 200000 },
  { date: "2026-06-04", description: "Gà", category: THIET_YEU, card: null, note: null, amount: 920000 },
  { date: "2026-06-04", description: "Gội đầu", category: CA_NHAN, card: null, note: null, amount: 300000 },
  { date: "2026-06-04", description: "Mát xa", category: CA_NHAN, card: null, note: null, amount: 350000 },
  { date: "2026-06-03", description: "Đồ bánh", category: THIET_YEU, card: null, note: null, amount: 95000 },
  { date: "2026-06-03", description: "Bún chả", category: THIET_YEU, card: null, note: null, amount: 135000 },
  { date: "2026-06-02", description: "Trà ddas", category: THIET_YEU, card: null, note: null, amount: 85000 },
  { date: "2026-06-01", description: "Mũ mlb", category: CA_NHAN, card: null, note: null, amount: 370000 },
  { date: "2026-07-06", description: "Thẻ tech", category: TRA_NO, card: null, note: null, amount: 7337329 },
  { date: "2026-07-10", description: "Thẻ vpbank", category: TRA_NO, card: null, note: null, amount: 9385631 },
  { date: "2026-05-26", description: "Đáo thẻ vcb", category: TRA_NO, card: null, note: null, amount: 2244000 },
  { date: "2026-05-28", description: "PT", category: SUC_KHOE, card: null, note: "51 buổi PT", amount: 6500000 },
  { date: "2026-07-06", description: "cho ông", category: BIEU, card: null, note: null, amount: 5000000 },
  { date: "2026-07-02", description: "Netflix", category: GIAI_TRI, card: "Tech", note: null, amount: 123900 },
  { date: "2026-07-02", description: "Tiêm cúm", category: SON, card: "Tech", note: null, amount: 333000 },
  { date: "2026-07-02", description: "Thẻ dt", category: THIET_YEU, card: "VPbank", note: null, amount: 100000 },
  { date: "2026-07-02", description: "Tôm", category: THIET_YEU, card: null, note: null, amount: 230000 },
  { date: "2026-07-03", description: "Máy làm waffle", category: SON, card: "VPbank", note: null, amount: 557000 },
  { date: "2026-07-04", description: "Bánh mì", category: THIET_YEU, card: null, note: null, amount: 200000 },
  { date: "2026-07-04", description: "Áo son", category: SON, card: "VPbank", note: null, amount: 105000 },
  { date: "2026-07-04", description: "Trà sữa", category: THIET_YEU, card: null, note: null, amount: 80000 },
  { date: "2026-07-04", description: "Khăn khô", category: SON, card: "Tech", note: null, amount: 319200 },
  { date: "2026-07-05", description: "Thịt", category: THIET_YEU, card: null, note: null, amount: 660000 },
  { date: "2026-07-05", description: "Bơi", category: SUC_KHOE, card: null, note: null, amount: 2100000 },
  { date: "2026-07-06", description: "Áo messi son", category: SON, card: null, note: null, amount: 271000 },
  { date: "2026-07-06", description: "Áo messi gin", category: BIEU, card: null, note: null, amount: 400000 },
  { date: "2026-07-06", description: "nc rửa rau củ", category: THIET_YEU, card: "VPbank", note: null, amount: 88800 },
  { date: "2026-07-06", description: "coopmart", category: THIET_YEU, card: "Tech", note: null, amount: 618549 },
  { date: "2026-07-07", description: "bánh huế", category: THIET_YEU, card: null, note: null, amount: 458000 },
  { date: "2026-07-06", description: "nem tai", category: THIET_YEU, card: null, note: null, amount: 135000 },
  { date: "2026-07-07", description: "cá", category: THIET_YEU, card: null, note: null, amount: 285000 },
  { date: "2026-07-07", description: "Cháo son", category: SON, card: null, note: null, amount: 365000 },
  { date: "2026-07-11", description: "ăn", category: THIET_YEU, card: null, note: null, amount: 30000 },
  { date: "2026-07-09", description: "núm cốc", category: SON, card: "Tech", note: null, amount: 123200 },
  { date: "2026-07-10", description: "starbucks", category: THIET_YEU, card: "VCB", note: null, amount: 186000 },
  { date: "2026-07-12", description: "dừa", category: THIET_YEU, card: null, note: null, amount: 185000 },
  { date: "2026-07-12", description: "xịt mũi", category: THIET_YEU, card: "Tech", note: null, amount: 60000 },
  { date: "2026-07-12", description: "găng tay", category: THIET_YEU, card: "VPbank", note: null, amount: 182400 },
  { date: "2026-07-13", description: "coopmart", category: THIET_YEU, card: "Tech", note: null, amount: 822121 },
  { date: "2026-07-13", description: "cọc argicola", category: GIAI_TRI, card: null, note: null, amount: 300000 },
  { date: "2026-07-13", description: "dán màn", category: THIET_YEU, card: null, note: null, amount: 70000 },
  { date: "2026-07-14", description: "ăn", category: THIET_YEU, card: null, note: null, amount: 115000 },
  { date: "2026-07-15", description: "Vay vpbank", category: TRA_NO, card: null, note: null, amount: 3877876 },
  { date: "2026-07-16", description: "Sầu b Nhung", category: BIEU, card: null, note: null, amount: 500000 },
];

export const SEED_INCOME: { month: string; amount: number }[] = [
  { month: "2026-05", amount: 20000000 },
  { month: "2026-06", amount: 22000000 },
  { month: "2026-07", amount: 22000000 },
  { month: "2026-08", amount: 29821739 },
  { month: "2026-09", amount: 12240000 },
];
