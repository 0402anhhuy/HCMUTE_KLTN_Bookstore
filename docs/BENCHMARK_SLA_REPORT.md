# BÁO CÁO MINH CHỨNG ĐO LƯỜNG THỜI GIAN PHẢN HỒI (SLA BENCHMARK)

> **Thời điểm kiểm chuẩn**: 2026-11-18 14:50:29
> **Cam kết chất lượng dịch vụ (SLA)**: Thời gian phản hồi trong vòng **3 - 5 giây** (Mục tiêu tối ưu $\le 3000\text{ ms}$).

### 1. Thống kê tổng hợp
- **Tổng số ca kiểm thử (Test cases)**: 26 endpoints
- **Tỷ lệ đạt chuẩn SLA (<= 3s)**: 100% (26/26 ca)
- **Thời gian phản hồi trung bình**: 343.15 ms
- **Thời gian phản hồi nhanh nhất**: 41 ms
- **Thời gian phản hồi lâu nhất**: 1140 ms

### 2. Chi tiết đo lường theo từng Role

| Vai trò | Tính năng | API Endpoint | Thời gian phản hồi | Đánh giá SLA |
| :--- | :--- | :--- | :---: | :---: |
| **GUEST** | Danh sách sản phẩm Catalog | `/api/products?page=0&size=12` | **1140 ms** | ✅ ĐẠT |
| **GUEST** | Tìm kiếm từ khóa | `/api/products?keyword=sach` | **42 ms** | ✅ ĐẠT |
| **GUEST** | Lọc khoảng giá | `/api/products?minPrice=...&maxPrice=...` | **924 ms** | ✅ ĐẠT |
| **GUEST** | Danh sách Nhà xuất bản | `/api/products/publishers` | **41 ms** | ✅ ĐẠT |
| **GUEST** | Chi tiết sản phẩm | `/api/products/180067` | **246 ms** | ✅ ĐẠT |
| **GUEST** | Danh mục sản phẩm | `/api/categories` | **471 ms** | ✅ ĐẠT |
| **GUEST** | Danh mục gốc (Roots) | `/api/categories/roots` | **172 ms** | ✅ ĐẠT |
| **GUEST** | Chương trình khuyến mãi | `/api/promotions/active` | **47 ms** | ✅ ĐẠT |
| **GUEST** | Đánh giá sản phẩm | `/api/reviews/product/180067` | **41 ms** | ✅ ĐẠT |
| **GUEST** | Đăng ký & Gửi OTP | `/api/auth/register` | **436 ms** | ✅ ĐẠT |
| **USER** | Đăng nhập tài khoản | `/api/auth/login` | **521 ms** | ✅ ĐẠT |
| **USER** | Thông tin hồ sơ cá nhân | `/api/users/profile` | **144 ms** | ✅ ĐẠT |
| **USER** | Xem giỏ hàng | `/api/cart` | **236 ms** | ✅ ĐẠT |
| **USER** | Lịch sử đơn mua của tôi | `/api/orders` | **114 ms** | ✅ ĐẠT |
| **MANAGER** | Đăng nhập Manager | `/api/auth/login` | **371 ms** | ✅ ĐẠT |
| **MANAGER** | Toàn bộ đơn hàng hệ thống | `/api/orders/all` | **873 ms** | ✅ ĐẠT |
| **MANAGER** | Yêu cầu trả hàng & hoàn tiền | `/api/orders/returns` | **232 ms** | ✅ ĐẠT |
| **MANAGER** | Biến động nhập xuất kho | `/api/products/stock-movements` | **331 ms** | ✅ ĐẠT |
| **MANAGER** | Thống kê sản phẩm Active | `/api/products/count/status/ACTIVE` | **75 ms** | ✅ ĐẠT |
| **MANAGER** | Kiểm duyệt đánh giá sản phẩm | `/api/reviews` | **240 ms** | ✅ ĐẠT |
| **MANAGER** | Danh sách đội ngũ Shipper | `/api/shippers` | **249 ms** | ✅ ĐẠT |
| **ADMIN** | Đăng nhập Admin | `/api/auth/login` | **273 ms** | ✅ ĐẠT |
| **ADMIN** | Quản lý danh sách người dùng | `/api/users` | **221 ms** | ✅ ĐẠT |
| **ADMIN** | Thống kê tổng người dùng | `/api/users/total` | **209 ms** | ✅ ĐẠT |
| **ADMIN** | Nhật ký kiểm toán hệ thống | `/api/admin/audit-logs` | **305 ms** | ✅ ĐẠT |
| **ADMIN** | Quản lý khuyến mãi toàn sàn | `/api/admin/promotions` | **968 ms** | ✅ ĐẠT |
