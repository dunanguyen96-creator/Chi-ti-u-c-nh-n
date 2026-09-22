# Chi tiêu cá nhân

Web app ghi chú chi tiêu và theo dõi báo cáo, thay thế cho Google Sheet theo dõi chi tiêu cá nhân. Mọi dữ liệu nhập vào đều **tự động lưu** vào database (SQLite) ngay khi bạn gõ — không cần bấm nút lưu riêng.

## Tính năng

- **Tổng quan**: thu nhập, tổng chi, chênh lệch theo tháng + biểu đồ chi theo hạng mục.
- **Giao dịch**: thêm giao dịch mới, sửa trực tiếp trên bảng (ngày, mô tả, hạng mục, thẻ, số tiền, ghi chú) — tự động lưu sau khi gõ ~0.6s. Nội dung form thêm mới cũng được lưu tạm trên trình duyệt để không mất dữ liệu nếu lỡ rời trang.
- **Báo cáo**: bảng tổng hợp chi tiêu theo hạng mục × tháng, cùng thu nhập và chênh lệch từng tháng.
- **Nợ / Thẻ**: quản lý các khoản vay, thẻ tín dụng — lãi suất tháng/năm, phí dịch vụ, số tiền đã vay/còn phải trả, hạn mức còn lại, ngày chốt lãi, ngày thanh toán, chính sách hoàn tiền.

Danh mục chi tiêu (Thiết yếu, Cà phê/ăn vặt, Cá nhân, Sức khỏe, Biếu/Hiếu/hỉ, Giải trí, Học, Trả nợ/đáo thẻ, Mèo, Son, Khác) được lấy đúng theo bảng chi tiêu gốc.

## Bắt đầu

```bash
npm install
npx prisma migrate deploy   # tạo database SQLite theo schema
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Dữ liệu được lưu trong file SQLite `prisma/dev.db` (đường dẫn cấu hình qua biến `DATABASE_URL` trong `.env`, xem mẫu ở `.env.example`).

## Công nghệ

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite — không cần cấu hình dịch vụ ngoài
- API routes (`src/app/api/*`) xử lý lưu/sửa/xoá; các component client tự động gọi API sau khi người dùng nhập liệu (debounce ~600ms) để auto-save.

## Cấu trúc dữ liệu

- `Transaction`: giao dịch chi tiêu (ngày, mô tả, hạng mục, thẻ, số tiền, ghi chú)
- `Income`: thu nhập theo tháng
- `DebtAccount`: khoản vay / thẻ tín dụng và các thông tin lãi suất, hạn mức, ngày thanh toán

Xem chi tiết ở `prisma/schema.prisma`.
