export const CATEGORIES = [
  "Thiết yếu: Thực phẩm/ gia dụng/ công việc...",
  "Cà phê/ ăn vặt/ ăn sáng...",
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

export const CARDS = ["Tech", "VPbank", "VCB"] as const;

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

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
}
