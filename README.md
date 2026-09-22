# Chi tiêu cá nhân

Web app ghi chú chi tiêu và theo dõi báo cáo, thay thế cho Google Sheet theo dõi chi tiêu cá nhân. Mọi dữ liệu nhập vào đều **tự động lưu** vào database ngay khi bạn gõ — không cần bấm nút lưu riêng.

## Tính năng

- **Tổng quan**: thu nhập, tổng chi, chênh lệch theo tháng + biểu đồ chi theo hạng mục.
- **Giao dịch**: thêm giao dịch mới, sửa trực tiếp trên bảng (ngày, mô tả, hạng mục, thẻ, số tiền, ghi chú) — tự động lưu sau khi gõ ~0.6s. Nội dung form thêm mới cũng được lưu tạm trên trình duyệt để không mất dữ liệu nếu lỡ rời trang.
- **Báo cáo**: bảng tổng hợp chi tiêu theo hạng mục × tháng, cùng thu nhập và chênh lệch từng tháng.
- **Nợ / Thẻ**: quản lý các khoản vay, thẻ tín dụng — lãi suất tháng/năm, phí dịch vụ, số tiền đã vay/còn phải trả, hạn mức còn lại, ngày chốt lãi, ngày thanh toán, chính sách hoàn tiền.

Danh mục chi tiêu (Thiết yếu, Cà phê/ăn vặt, Cá nhân, Sức khỏe, Biếu/Hiếu/hỉ, Giải trí, Học, Trả nợ/đáo thẻ, Mèo, Son, Khác) được lấy đúng theo bảng chi tiêu gốc.

## Chạy ở máy cá nhân

Cần một database PostgreSQL (có thể chạy Postgres cục bộ, hoặc lấy connection string miễn phí từ [Neon](https://neon.tech) / [Vercel Postgres](https://vercel.com/storage/postgres) — dùng chung với database production luôn cho tiện).

```bash
npm install
cp .env.example .env   # rồi điền DATABASE_URL của bạn vào
npx prisma migrate deploy
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Deploy lên Vercel (miễn phí)

### 1. Tạo database Postgres miễn phí

- Vào [vercel.com](https://vercel.com) → tạo project (xem bước 2) → tab **Storage** → **Create Database** → chọn **Postgres** (Neon) → tạo ở region gần Việt Nam (Singapore).
- Vercel sẽ tự thêm biến môi trường `DATABASE_URL` (và vài biến khác) vào project — không cần copy tay.
- (Nếu muốn tạo trước bằng tay: đăng ký free tại [neon.tech](https://neon.tech), tạo project, copy connection string dạng `postgresql://...?sslmode=require` để dán vào bước 3.)

### 2. Import repo vào Vercel

- Đăng nhập [vercel.com](https://vercel.com) bằng GitHub.
- **Add New → Project** → chọn repo `dunanguyen96-creator/Chi-ti-u-c-nh-n`, nhánh `claude/kind-fermi-7v1n8q` (hoặc nhánh `main` sau khi merge).
- Vercel tự nhận đây là app Next.js, không cần đổi cấu hình build.

### 3. Kiểm tra biến môi trường

- Vào **Settings → Environment Variables**, đảm bảo có `DATABASE_URL` trỏ đúng tới database ở bước 1.

### 4. Deploy

- Bấm **Deploy**. Build sẽ tự chạy `prisma generate` + `prisma migrate deploy` (tạo bảng trong database) rồi mới build app (đã cấu hình sẵn trong `package.json`).
- Sau khi xong, Vercel cho một link dạng `https://ten-project.vercel.app` — mở là dùng được, dữ liệu nhập vào sẽ lưu thẳng vào Postgres, truy cập từ điện thoại/máy tính nào cũng thấy chung dữ liệu.
- Mỗi lần push code lên nhánh đã kết nối, Vercel tự động deploy lại.

## Công nghệ

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- API routes (`src/app/api/*`) xử lý lưu/sửa/xoá; các component client tự động gọi API sau khi người dùng nhập liệu (debounce ~600ms) để auto-save.

## Cấu trúc dữ liệu

- `Transaction`: giao dịch chi tiêu (ngày, mô tả, hạng mục, thẻ, số tiền, ghi chú)
- `Income`: thu nhập theo tháng
- `DebtAccount`: khoản vay / thẻ tín dụng và các thông tin lãi suất, hạn mức, ngày thanh toán

Xem chi tiết ở `prisma/schema.prisma`.
