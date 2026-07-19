# UTEShop - Hệ Thống Bookstore E-Commerce (HCMUTE KLTN)

Hệ thống quản lý và kinh doanh sách trực tuyến UTEShop được xây dựng nhằm phục vụ nhu cầu mua sắm sách của khách hàng và quản lý kho hàng, đơn hàng chuyên nghiệp cho quản trị viên. Dự án bao gồm hai thành phần chính: **bookstore_be** (Backend API phát triển trên Spring Boot) và **bookstore_fe** (Frontend Web phát triển trên React + Vite).

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Backend (`bookstore_be`)
* **Ngôn ngữ:** Java 21
* **Framework:** Spring Boot 3.x / 4.x
* **Bảo mật:** Spring Security & JWT (JSON Web Token)
* **Cơ sở dữ liệu:** MySQL (Driver: `mysql-connector-j`)
* **ORM:** Spring Data JPA (Hibernate)
* **Xác thực OTP:** JavaMailSender (gửi mã xác nhận đăng ký & khôi phục mật khẩu)
* **Thông báo thời gian thực:** Spring WebSocket (giao tiếp kênh truyền thông báo real-time)
* **Thanh toán trực tuyến:** Tích hợp Cổng thanh toán **VNPAY Sandbox**
* **Khác:** Lombok, Jakarta Validation, Spring Boot DevTools.

### 2. Frontend (`bookstore_fe`)
* **Ngôn ngữ:** JavaScript (ES6+)
* **Thư viện chính:** React 19, React DOM 19
* **Công cụ xây dựng:** Vite 8
* **Quản lý định tuyến:** React Router DOM 7
* **Giao tiếp HTTP:** Axios 1.x
* **Icons:** Lucide React
* **Quản lý trạng thái:** React Context API (`AppContext`)

---

## 🌟 Các Tính Năng Chính

* **Đăng ký & Đăng nhập bảo mật:** Xác thực người dùng qua mã OTP gửi tới Email khi đăng ký và khôi phục mật khẩu. Xác thực các phiên truy cập qua JWT Token.
* **Tìm kiếm & Bộ lọc nâng cao:** Hỗ trợ tìm kiếm sách không phân biệt chữ hoa/thường theo tên sách, tác giả, nhà xuất bản; lọc theo thể loại (Category) và khoảng giá bán.
* **Xem chi tiết sản phẩm:** Giao diện chi tiết sách hiển thị thư viện ảnh phụ, thông tin chi tiết, đánh giá & nhận xét từ khách hàng thực tế và gợi ý sách cùng thể loại.
* **Quản lý Giỏ hàng (`Cart`):** Thêm, xóa, cập nhật số lượng sách trong giỏ hàng. Kiểm tra tồn kho thời gian thực trước khi thêm sản phẩm.
* **Thanh toán thông minh:**
  * Áp dụng mã giảm giá (Discount Vouchers / Coupons).
  * Tích lũy và trừ điểm thưởng khi thanh toán.
  * Tích hợp thanh toán online qua ví điện tử/ngân hàng nội địa với **VNPAY Sandbox**.
* **Trang Quản trị (Manager Dashboard):**
  * Quản lý thông tin sách (thêm, sửa, xóa, duyệt sản phẩm).
  * Quản lý xuất/nhập kho và lưu vết chuyển động kho (`StockMovement`).
* **Thông báo Real-time:** Nhận thông báo kích hoạt tài khoản, đặt hàng thành công, đổi mật khẩu và cảnh báo kho hàng qua kết nối **WebSocket**.

---

## 🗄️ Cấu Hình Hệ Thống

### 1. Cơ sở dữ liệu (MySQL)
Mặc định hệ thống sử dụng cơ sở dữ liệu MySQL chạy trên `localhost:3306` với tên database là `bookstore_db`.
* Cấu hình kết nối nằm trong file: `bookstore_be/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookstore_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
```

### 2. Dịch vụ Mail OTP
Hệ thống sử dụng tài khoản Gmail SMTP để gửi mã OTP. Vui lòng thiết lập App Password của Gmail trong file cấu hình để dịch vụ hoạt động bình thường:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Cổng thanh toán VNPAY Sandbox
```properties
vnpay.tmn-code=9IFBW7P7
vnpay.hash-secret=J6ST1VDWJE0FKLZTZBBJL0BLLB1OKM4U
vnpay.api-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:5173/payment/vnpay-callback
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Hệ Thống
* JDK 21 hoặc cao hơn.
* Node.js (v18 trở lên) & npm.
* MySQL Server đang hoạt động.
* Maven 3.x.

### Bước 1: Khởi chạy Backend (`bookstore_be`)
1. Di chuyển vào thư mục backend:
   ```bash
   cd bookstore_be
   ```
2. Cấu hình lại username và password MySQL trong file `src/main/resources/application.properties` (nếu cần).
3. Biên dịch và chạy ứng dụng bằng Maven Wrapper:
   * **Windows (PowerShell/CMD):**
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **Linux/macOS:**
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
4. Backend sẽ chạy tại cổng: `http://localhost:8081`

### Bước 2: Khởi chạy Frontend (`bookstore_fe`)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../bookstore_fe
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Chạy ứng dụng ở chế độ phát triển (Development):
   ```bash
   npm run dev
   ```
4. Ứng dụng Frontend sẽ chạy tại cổng mặc định của Vite: `http://localhost:5173` (hoặc cổng được hiển thị trong terminal).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
HCMUTE_KLTN_Bookstore/
├── bookstore_be/                # Backend Spring Boot
│   ├── src/main/java/com/kltn/bookstore_be/
│   │   ├── audit/               # Log và vết hoạt động hệ thống
│   │   ├── catalog/             # Quản lý sản phẩm (Book), danh mục (Category), kho
│   │   ├── common/              # Cấu hình chung, gửi Mail
│   │   ├── identity/            # Quản lý User, OTP, Phân quyền Security
│   │   ├── notification/        # Quản lý thông báo & WebSockets
│   │   ├── ordering/            # Quản lý Giỏ hàng, Đơn hàng, Voucher
│   │   └── payment/             # Tích hợp cổng thanh toán VNPAY
│   └── src/main/resources/      # Cấu hình properties & SQL
│
├── bookstore_fe/                # Frontend React
│   ├── src/
│   │   ├── assets/              # Tài nguyên hình ảnh, css
│   │   ├── components/
│   │   │   ├── manager/         # Màn hình quản trị (kho, sách, thống kê)
│   │   │   └── user/            # Màn hình cho khách hàng (chi tiết, thanh toán,...)
│   │   ├── context/             # Quản lý trạng thái toàn cục (AppContext)
│   │   └── services/            # Cấu hình Axios API calls
│   └── index.html               # Điểm khởi đầu giao diện
└── README.md                    # Hướng dẫn dự án
```

---

## 🔒 Danh sách Tài khoản Test Demo

Sau khi chạy dự án thành công, bạn có thể đăng nhập thử nghiệm bằng các tài khoản sau (tất cả đều sử dụng mật khẩu chung):
* **Mật khẩu chung:** `password`
* **Tài khoản Khách hàng (USER):** `user@gmail.com`
* **Tài khoản Quản lý (MANAGER):** `manager@gmail.com`
* **Tài khoản Quản trị viên (ADMIN):** `admin@gmail.com`