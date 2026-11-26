# Coding Convention & Quy chuẩn Kỹ thuật Dự án Bookstore

Tài liệu này quy định chuẩn viết mã, cấu trúc module, bảo mật cấu hình và quy trình kiểm soát chất lượng cho cả **Backend (`bookstore_be`)** và **Frontend (`bookstore_fe`)**.

---

## 1. Backend (`bookstore_be` — Java 21 / Spring Boot 4)

### 1.1. Kiến trúc Modular Monolith
Mã nguồn đặt trong package gốc `com.kltn.bookstore_be`, chia theo các domain nghiệp vụ:
- `audit`, `catalog`, `identity`, `notification`, `ordering`, `payment`, `review`
- Hạ tầng dùng chung: `common` (dịch vụ email, upload ảnh, xử lý ngoại lệ toàn cục), `config` (Security, WebSocket, CORS).

Mỗi domain tách rõ 4 tầng:
1. `domain/`: JPA Entity, Enum, Repository interface.
2. `application/`: Service xử lý nghiệp vụ, Request/Response DTO, Exception nghiệp vụ.
3. `infrastructure/`: Adapter kỹ thuật (JWT, Mail, Cloudinary, VNPay, Seeder, WebSocket).
4. `presentation/`: `@RestController` nhận request và trả DTO/ResponseEntity.

### 1.2. Quy ước đặt tên & cú pháp Java
- **Class / Interface / Enum / Record:** `PascalCase` (ví dụ: `PromotionService`, `VNPayUtil`).
- **Biến, tham số, phương thức:** `camelCase` (ví dụ: `generateAndSendOtp`).
- **Hằng số (`static final`):** `UPPER_SNAKE_CASE` (ví dụ: `SECURE_RANDOM`, `IPV4_PATTERN`).
- **Bảng & cột CSDL:** `snake_case`.
- **Indentation & định dạng:** Thụt lề **4 spaces** (không dùng Tab), UTF-8, độ dài dòng khuyến nghị <= 120 ký tự, tránh wildcard import (`import ...*`) ở code mới.
- **Generic & an toàn kiểu:** Luôn khai báo tham số kiểu cụ thể (ví dụ `Map<String, Object> params = new HashMap<>();`), không để raw type gây cảnh báo `javac -Xlint:unchecked`.

### 1.3. Logging, Ngoại lệ & Bảo mật Backend
- **Logging:** Sử dụng SLF4J (`@Slf4j` của Lombok). **Không** dùng `System.out.println`, `System.err.println` hay `e.printStackTrace()` trong code nghiệp vụ/controller.
- **Thông tin nhạy cảm:** Tuyệt đối **không** ghi OTP, mật khẩu, JWT token, secret key hoặc dữ liệu thẻ ra log.
- **Xử lý ngoại lệ:** Không viết khối `catch` rỗng hoặc nuốt ngoại lệ im lặng (`DE_MIGHT_IGNORE`); ưu tiên bắt đúng ngoại lệ cụ thể (ví dụ `GeneralSecurityException`) thay cho `catch (Exception)` khi không cần thiết (`REC_CATCH_EXCEPTION`), và xử lý tập trung qua `GlobalExceptionHandler`.
- **Sinh số ngẫu nhiên bảo mật:** Mọi mã xác thực (OTP, token) phải dùng `java.security.SecureRandom` dùng chung (`static final`), không khởi tạo `new Random()` theo từng lần gọi (`DMI_RANDOM_USED_ONLY_ONCE`).

---

## 2. Frontend (`bookstore_fe` — React 19 / Vite 8)

### 2.1. Tổ chức thư mục (`bookstore_fe/src`)
- Phân nhóm theo vai trò & phạm vi: `admin/`, `manager/`, `user/`, `auth/`, `common/`, cùng `context/`, `services/`, `utils/`, `styles/`.
- Mỗi màn hình/chức năng gom trong thư mục riêng gồm:
  - `Component.jsx`: Tầng hiển thị UI.
  - `useComponent.js`: Custom hook quản lý state, side-effect và gọi API.
  - `Component.css`: Stylesheet dùng prefix theo module để tránh xung đột CSS.
  - `<helper>.js` & `<helper>.test.js`: Tách logic tính toán thuần (giá, khuyến mãi, lọc, validation) để kiểm thử đơn vị bằng `node --test`.

### 2.2. Quy chuẩn React & ESLint
- **Tên file component:** `PascalCase.jsx`; custom hook: `useCamelCase.js`; hàm thuần/helper: `camelCase.js`.
- **Clean code:** Toàn bộ dự án phải vượt qua `npm run lint` với **0 errors và 0 warnings** (`no-unused-vars`, `no-undef`, `no-useless-assignment`, `react-hooks/set-state-in-effect`, `react-hooks/immutability`, `react-hooks/purity`, `react-hooks/exhaustive-deps`, `react-refresh/only-export-components`).
- **React Hooks chuẩn React 19:**
  - Khởi tạo/tính toán dữ liệu dẫn xuất bằng `useMemo` hoặc trong lúc render thay cho gọi `setState` đồng bộ trong `useEffect`.
  - Bọc callback dùng trong `useEffect` bằng `useCallback` và khai báo trước `useEffect`.
  - Tách Context object (`AppContext.jsx`) khỏi Provider component (`AppProvider.jsx`) để bảo toàn Fast Refresh.
- **UI/UX:** Dùng Modal/Dialog của hệ thống và `showToast` thay cho `window.alert`, `window.confirm`, `window.prompt`.

---

## 3. Bảo mật Cấu hình & Quy trình Git / CI

### 3.1. Quản lý Secret & Biến môi trường
- **Không** commit file chứa secret thật (`application.properties`, `.env`, private key, token). Đưa các file cấu hình cục bộ vào `.gitignore`.
- File mẫu (`application.properties.example`) và cấu hình test (`application-test.properties`) chỉ được chứa **placeholder** hoặc biến môi trường dạng `${ENV_VAR:default_an_toan}` — không chứa thông tin CSDL cloud, mật khẩu thật hay khóa sandbox cố định.
- Mọi thay đổi được kiểm tra quét secret tự động qua **Gitleaks** trên GitHub Actions.

### 3.2. Nhánh, Commit & Pull Request
- Luôn tạo nhánh mới từ `origin/main` theo tiền tố: `feat/...`, `fix/...`, `refactor/...`, `test/...`, `chore/...`. Không push hoặc merge trực tiếp vào `main`.
- Commit message theo chuẩn **Conventional Commits**: `<type>(<scope>): <mô tả ngắn>`.
- Trước khi tạo Pull Request, bắt buộc chạy kiểm tra cục bộ và đảm bảo CI xanh:
  - Frontend: `npm run lint`, `node --test src/**/*.test.js`, `npm run build`.
  - Backend: `mvnw test`, `mvnw spotbugs:spotbugs`.
