# Bookstore - Hệ Thống Thương Mại Điện Tử (HCMUTE KLTN)

Hệ thống quản lý và kinh doanh sách trực tuyến Bookstore được xây dựng nhằm đáp ứng nhu cầu mua sắm sách của khách hàng và cung cấp bộ công cụ quản trị chuyên nghiệp cho bộ phận Quản lý (Manager) và Quản trị viên (Admin). Dự án được thiết kế theo kiến trúc Client-Server tách biệt giữa Backend API (Spring Boot 3) và Frontend Web Application (React 19 + Vite 8).

---

## 1. Công Nghệ Sử Dụng

### 1.1. Backend (`bookstore_be`)
- **Ngôn ngữ:** Java 21
- **Framework:** Spring Boot 3.x
- **Bảo mật:** Spring Security 6, JWT (JSON Web Token), mã hóa mật khẩu BCrypt
- **Cơ sở dữ liệu:** MySQL / TiDB Cloud MySQL
- **ORM & Data Access:** Spring Data JPA, Hibernate, Criteria API / Specifications
- **Bộ nhớ đệm (Caching):** Redis (Spring Data Redis, CacheManager)
- **Lưu trữ tệp đa phương tiện:** Cloudinary SDK (tải lên và quản lý ảnh bìa sách)
- **Thông báo thời gian thực:** Spring WebSocket (STOMP / SockJS)
- **Dịch vụ Email & OTP:** JavaMailSender (gửi mã xác thực đăng ký và đặt lại mật khẩu)
- **Cổng thanh toán:** VNPAY Sandbox Gateway (thanh toán trực tuyến và xử lý phản hồi IPN)
- **Kiểm thử:** JUnit 5, Mockito
- **Công cụ hỗ trợ khác:** Lombok, Jakarta Validation, Maven

### 1.2. Frontend (`bookstore_fe`)
- **Ngôn ngữ:** JavaScript (ES6+), JSX
- **Thư viện giao diện:** React 19, React DOM 19
- **Công cụ đóng gói:** Vite 8
- **Điều hướng & Routing:** React Router DOM 7
- **Giao tiếp HTTP:** Axios (Interceptors, Token refresh, Error handling)
- **Quản lý trạng thái:** React Context API (`AppContext`, `CartContext`, `NotificationContext`)
- **Bộ icon kỹ thuật:** Lucide React
- **Hệ thống giao diện:** Modern CSS (CSS Variables, Responsive Dual-device cho Desktop và Mobile)
- **Tự động hóa CI/CD:** GitHub Actions, Vercel CLI (tự động build và deploy Frontend)

---

## 2. Các Tính Năng Chính

### 2.1. Phân hệ Khách hàng (Customer / User)
- **Xác thực & Tài khoản:**
  - Đăng ký tài khoản và kích hoạt bảo mật qua mã xác thực OTP gửi về Email.
  - Đăng nhập bảo mật qua JWT Token.
  - Khôi phục và đặt lại mật khẩu thông qua OTP Email.
  - Quản lý thông tin hồ sơ, thay đổi mật khẩu, quản lý sổ địa chỉ giao hàng.
- **Tìm kiếm & Khám phá sách:**
  - Tìm kiếm theo tên sách, tác giả, nhà xuất bản.
  - Bộ lọc đa tiêu chí: lọc theo danh mục phân cấp, khoảng giá, ngôn ngữ, đánh giá sao thực tế.
  - Trang chi tiết sách: hiển thị thông số, thư viện ảnh phụ, nhận xét từ người mua thực tế, gợi ý sách cùng chuyên mục.
- **Giỏ hàng & Khuyến mãi:**
  - Giỏ hàng hoạt động linh hoạt (hỗ trợ cả khách vãng lai và người dùng đã đăng nhập).
  - Tính phí vận chuyển tự động dựa trên trạng thái chọn sản phẩm.
  - Tự động áp dụng mã giảm giá tốt nhất (Best Coupon) hoặc cho phép nhập mã thủ công tại trang thanh toán.
  - Tích lũy và trừ điểm thưởng trực tiếp vào hóa đơn.
- **Thanh toán & Đơn hàng:**
  - Hỗ trợ 2 hình thức thanh toán: Thanh toán khi nhận hàng (COD) và Thanh toán trực tuyến qua VNPAY Sandbox.
  - Xử lý phản hồi thanh toán tức thì và điều hướng trạng thái đơn hàng.
  - Theo dõi lộ trình đơn hàng theo thời gian thực (Chờ xác nhận, Đang đóng gói, Đang giao hàng, Đã giao thành công, Đã hủy).
  - Nhận diện thông tin Shipper được phân công phụ trách đơn hàng.
  - Đánh giá và chấm điểm sao cho sản phẩm sau khi đơn hàng giao thành công.
  - Quản lý danh sách sách yêu thích (Wishlist).
  - Nhận thông báo trạng thái đơn hàng theo thời gian thực qua WebSocket.

### 2.2. Phân hệ Quản lý (Manager)
- **Quản lý Kho hàng (Warehouse):** Kiểm soát tồn kho thời gian thực, nhập kho, xuất kho, điều chỉnh số lượng tồn kho và lưu vết lịch sử biến động kho (`StockMovement`).
- **Quản lý Sản phẩm (Products):** Thêm sách mới, duyệt sản phẩm, cập nhật thông tin, tải ảnh lên Cloudinary, quản lý danh mục và giá bán.
- **Quản lý Đơn hàng (Orders):**
  - Tra cứu toàn bộ danh sách đơn hàng với bộ lọc trạng thái và ngày đặt.
  - Duyệt và chuyển trạng thái đơn hàng theo quy trình đóng gói và vận chuyển.
  - Phân công Shipper phụ trách đơn hàng dựa trên trạng thái hoạt động của từng người giao.
- **Quản lý Đội ngũ Shipper (Shippers):** Quản lý hồ sơ nhân viên giao hàng, biển số phương tiện, số điện thoại, trạng thái hoạt động và số lượng đơn đang giao.
- **Quản lý Đánh giá (Reviews):** Kiểm duyệt, theo dõi và phản hồi nhận xét của khách hàng đối với từng đầu sách.
- **Báo cáo Doanh thu (Revenue):** Biểu đồ doanh thu trực quan, phân tích theo khoảng thời gian thực tế, xuất báo cáo giao dịch ra file CSV chuẩn UTF-8.

### 2.3. Phân hệ Quản trị viên (Admin)
- **Quản trị Người dùng (Users):**
  - Quản lý danh sách tài khoản toàn hệ thống (User, Manager, Admin).
  - Thêm mới tài khoản với kiểm tra ràng buộc chặt chẽ về độ dài, ký tự đặc biệt, khoảng trắng và tính duy nhất của Email / Số điện thoại.
  - Cập nhật quyền hạn, khóa hoặc mở khóa tài khoản người dùng.
- **Quản lý Mã giảm giá (Coupons):** Thiết lập mã giảm theo phần trăm hoặc số tiền cố định, cấu hình hạn mức sử dụng, giá trị đơn tối thiểu và mức giảm tối đa.
- **Quản lý Chương trình Khuyến mãi (Promotions / Flash Sale):**
  - Tạo chương trình ưu đãi định kỳ hoặc chớp nhoáng (Flash Sale) theo khoảng thời gian.
  - Kiểm tra ràng buộc thời điểm bắt đầu không được nằm trong quá khứ.
  - Kiểm tra giá trị giảm giá không được vượt quá giá trị thực tế của sản phẩm áp dụng.
  - Tránh xung đột trùng lặp sản phẩm giữa các chương trình khuyến mãi cùng diễn ra.
- **Nhật ký Kiểm toán (Audit Logs):** Ghi nhận đầy đủ lịch sử các thao tác quan trọng (thêm sửa xóa người dùng, phân công đơn hàng, thay đổi kho, cập nhật khuyến mãi).
- **Tổng quan Kinh doanh:** Giám sát các chỉ số tăng trưởng, doanh thu toàn sàn, phương thức thanh toán phổ biến và xu hướng mua bán.

---

## 3. Cấu Hình Hệ Thống

Tập tin cấu hình chính của Backend nằm tại: `bookstore_be/src/main/resources/application.properties`

### 3.1. Cấu hình Cơ sở dữ liệu (MySQL / TiDB)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookstore_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### 3.2. Cấu hình Redis Cache
```properties
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.redis.time-to-live=3600000
```

### 3.3. Cấu hình Bảo mật JWT
```properties
app.jwt.secret=chuoi_khoa_bi_mat_jwt_dai_it_nhat_64_ky_tu_de_dam_bao_tieu_chuan_sha256
app.jwt.expiration-ms=86400000
```

### 3.4. Cấu hình Dịch vụ Mail OTP
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### 3.5. Cấu hình Cổng thanh toán VNPAY Sandbox
```properties
vnpay.tmn-code=your_tmn_code
vnpay.hash-secret=your_hash_secret
vnpay.api-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:5173/payment/vnpay-callback
```

### 3.6. Cấu hình Cloudinary
```properties
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy

### 4.1. Yêu cầu môi trường
- Java Development Kit (JDK): phiên bản 21 trở lên
- Node.js: phiên bản 18 trở lên (khuyên dùng Node.js 20 hoặc 22), npm phiên bản 9 trở lên
- MySQL Server hoặc TiDB Cloud
- Redis Server (tùy chọn khi bật caching)
- Maven 3.8 trở lên (hoặc sử dụng tệp lệnh Maven Wrapper đi kèm)

### 4.2. Khởi chạy Backend (`bookstore_be`)
1. Mở cửa sổ dòng lệnh và di chuyển vào thư mục backend:
   ```bash
   cd bookstore_be
   ```
2. Cập nhật thông số kết nối cơ sở dữ liệu trong `src/main/resources/application.properties`.
3. Biên dịch và khởi chạy ứng dụng:
   - Trên hệ điều hành Windows (PowerShell / CMD):
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   - Trên hệ điều hành Linux / macOS:
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
4. Backend API sẵn sàng phục vụ tại: `http://localhost:8081`

### 4.3. Khởi chạy Frontend (`bookstore_fe`)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../bookstore_fe
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện ứng dụng tại: `http://localhost:5173`

---

## 5. Cấu Trúc Thư Mục Dự Án

```text
HCMUTE_KLTN_Bookstore/
|-- .github/
|   `-- workflows/
|       `-- deploy-fe-vercel.yml       # Quy trình CI/CD tự động deploy Frontend lên Vercel
|
|-- bookstore_be/                      # Ứng dụng Backend (Spring Boot 3)
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/com/kltn/bookstore_be/
|   |   |   |   |-- audit/             # Ghi nhận nhật ký kiểm toán (AuditLogService, AuditLog)
|   |   |   |   |-- catalog/           # Quản lý sách, danh mục, tác giả, kho hàng
|   |   |   |   |-- common/            # Cấu hình chung, CORS, gửi Mail, xử lý ngoại lệ tập trung
|   |   |   |   |-- identity/          # Quản lý người dùng, JWT, OTP, UserDetailsService
|   |   |   |   |-- notification/      # Thông báo hệ thống và giao thức WebSocket
|   |   |   |   |-- ordering/          # Giỏ hàng, đơn hàng, coupon, promotion, phân công shipper
|   |   |   |   `-- payment/           # Tích hợp thanh toán VNPAY Sandbox
|   |   |   `-- resources/
|   |   |       `-- application.properties
|   |   `-- test/                      # Bộ kiểm thử Unit Test và Integration Test
|   `-- pom.xml
|
|-- bookstore_fe/                      # Ứng dụng Frontend (React 19 + Vite 8)
|   |-- src/
|   |   |-- assets/                    # Tài nguyên tĩnh (hình ảnh, logo, CSS toàn cục)
|   |   |-- components/
|   |   |   |-- admin/                 # Giao diện Quản trị viên (Users, Coupons, Promotions, Revenue, AuditLogs)
|   |   |   |-- manager/               # Giao diện Quản lý (Orders, Products, Warehouse, Shippers, Reviews)
|   |   |   |-- user/                  # Giao diện Khách hàng (Home, Catalog, Detail, Cart, Checkout, Profile)
|   |   |   `-- common/                # Thành phần dùng chung (BookCard, EmptyState, CategorySelector, Navbar, Footer)
|   |   |-- context/                   # Quản lý trạng thái toàn cục (AppContext, CartContext, NotificationContext)
|   |   |-- services/                  # Tầng giao tiếp API qua Axios
|   |   |-- utils/                     # Tiện ích định dạng tiền tệ, ngày giờ, cây danh mục
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|
`-- README.md                          # Tài liệu hướng dẫn dự án
```

---

## 6. Danh Sách Tài Khoản Thử Nghiệm

Sau khi khởi chạy hệ thống thành công, có thể sử dụng các tài khoản mặc định sau để kiểm tra đầy đủ các phân quyền:

- **Mật khẩu chung:** `password`
- **Tài khoản Khách hàng (USER):** `user@gmail.com`
- **Tài khoản Quản lý (MANAGER):** `manager@gmail.com`
- **Tài khoản Quản trị viên (ADMIN):** `admin@gmail.com`

---

## 7. Tiêu Chuẩn Kỹ Thuật & Đóng Góp Mã Nguồn

- **Quy trình Git:** Áp dụng mô hình Feature/Bug Branching; mỗi lỗi hoặc tính năng được phát triển trên nhánh riêng biệt xuất phát từ gốc thống nhất, mở Pull Request về nhánh `main` và bắt buộc code review trước khi tích hợp.
- **Quy chuẩn Commit:** Tuân thủ chuẩn Conventional Commits (`fix: ...`, `feat: ...`, `refactor: ...`, `style: ...`, `ci: ...`), không sử dụng emoji trong commit message và tiêu đề PR.
- **Tiêu chuẩn Kiểm tra:** Toan bộ mã nguồn Backend phải vượt qua quá trình biên dịch `mvn test-compile` với 0 lỗi; mã nguồn Frontend phải hoàn tất `npm run build` với 0 lỗi cảnh báo nghiêm trọng trước khi đẩy lên kho lưu trữ từ xa.
