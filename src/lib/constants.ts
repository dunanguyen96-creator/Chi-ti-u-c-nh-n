export const CATEGORIES = [
  "Thiết yếu: Thực phẩm/ gia dụng...",
  "Cà phê/ ăn vặt/ ăn sang...",
  "Công việc",
  "Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...",
  "Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao",
  "Biếu/ Hiếu/ hỉ/ Quà tặng",
  "Giải trí: đi chơi/ du lịch/ app giải trí",
  "Học",
  "Trả nợ/ đáo thẻ",
  "Mèo",
  "Son",
  "Khác",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICON: Record<Category, string> = {
  "Thiết yếu: Thực phẩm/ gia dụng...": "🛒",
  "Cà phê/ ăn vặt/ ăn sang...": "☕",
  "Công việc": "💼",
  "Cá nhân: Skincare/ Mỹ phẩm/ Quần áo/ Tóc...": "💇",
  "Sức khỏe: Thuốc/ bệnh viện/ bảo hiểm/ thể thao": "💊",
  "Biếu/ Hiếu/ hỉ/ Quà tặng": "🎁",
  "Giải trí: đi chơi/ du lịch/ app giải trí": "🎬",
  "Học": "📚",
  "Trả nợ/ đáo thẻ": "💳",
  "Mèo": "🐱",
  "Son": "👦",
  "Khác": "🔖",
};

export const CARDS = ["Tech 6505", "VPbank 4264", "VCB Sig 0328", "Mycash thấu chi"] as const;

export function monthKeyFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${month}/${year.slice(2)}`;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "YYYY-MM" -> compact "MMM-YY" (e.g. "Sep-26").
export function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_ABBR[month - 1]}-${String(year).slice(2)}`;
}

// "YYYY-MM-DD" (or a longer ISO string) -> "DD-MM-YYYY".
export function formatDateDMY(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${day}-${month}-${year}`;
}

export function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKeyFromDate(d);
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
}
