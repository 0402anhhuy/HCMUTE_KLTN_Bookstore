# BÁO CÁO MINH CHỨNG ĐO LƯỜNG THỜI GIAN PHẢN HỒI (SLA BENCHMARK)
## ĐỒ ÁN KHÓA LUẬN TỐT NGHIỆP: HỆ THỐNG WEBSITE NHÀ SÁCH TRỰC TUYẾN (BOOKSTORE)

> **Thời điểm kiểm chuẩn thực tế**: 2026-11-18 15:25:14
> **Cam kết chất lượng dịch vụ (SLA)**: Tất cả tính năng phản hồi trong vòng **3 - 5 giây** (Mục tiêu tối ưu $\le 3000\text{ ms}$).  
> **Tổng số tính năng kiểm chuẩn**: **79 / 79 tính năng (CN1 - CN79)**.  
> **Tỷ lệ đạt chuẩn SLA**: **100% (79/79 tính năng)**.

---

### 1. Thống Kê Tổng Hợp Hiệu Năng
- **Tổng số tính năng kiểm thử**: 79 tính năng (CN1 đến CN79)
- **Thời gian phản hồi trung bình**: **238.52 ms** (~0.24 giây/thao tác)
- **Thời gian phản hồi nhanh nhất**: **0 ms**
- **Thời gian phản hồi lâu nhất**: **1008 ms**
- **Tất cả các tính năng đều hoàn tất vượt trội dưới 3 giây**, đáp ứng trọn vẹn cam kết SLA (\le 3 - 5 giây).

---

### 2. Bảng Minh Chứng Chi Tiết 79 Tính Năng (CN1 - CN79)

| Mã CN | Tên tính năng | Vai trò | Người phụ trách | Mô tả nghiệp vụ / Endpoint | Thời gian phản hồi | Đánh giá SLA |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **CN1** | Đăng ký tài khoản | Khách hàng | Trần Anh Huy | Tạo tài khoản mới ở trạng thái chưa kích hoạt, validate email/SĐT/mật khẩu, gửi OTP về email <br>`POST /api/auth/register` | **585 ms** | ✅ **ĐẠT** |
| **CN2** | Xác thực OTP đăng ký | Khách hàng | Trần Anh Huy | So khớp mã OTP 6 số còn hiệu lực để kích hoạt tài khoản (chuyển sang ACTIVE) <br>`POST /api/auth/verify-otp` | **32 ms** | ✅ **ĐẠT** |
| **CN3** | Đăng nhập (JWT) | Khách hàng | Trần Anh Huy | Xác thực email/mật khẩu, sinh JWT, hỗ trợ ghi nhớ đăng nhập, cập nhật lần đăng nhập cuối <br>`POST /api/auth/login` | **555 ms** | ✅ **ĐẠT** |
| **CN4** | Quên mật khẩu | Khách hàng | Trần Anh Huy | Gửi OTP khôi phục mật khẩu về email người dùng <br>`POST /api/auth/forgot-password` | **227 ms** | ✅ **ĐẠT** |
| **CN5** | Đặt lại mật khẩu | Khách hàng | Trần Anh Huy | Kiểm tra OTP và ghi đè mật khẩu mới (mã hóa BCrypt) <br>`POST /api/auth/reset-password` | **9 ms** | ✅ **ĐẠT** |
| **CN6** | Xem hồ sơ cá nhân | Khách hàng | Trần Anh Huy | Trả về họ tên, email, SĐT, địa chỉ, avatar, vai trò, số xu và số dư ví <br>`GET /api/users/profile` | **174 ms** | ✅ **ĐẠT** |
| **CN7** | Cập nhật hồ sơ | Khách hàng | Trần Anh Huy | Cho phép sửa họ tên, SĐT, địa chỉ, avatar có kiểm tra định dạng và tính duy nhất <br>`PUT /api/users/profile` | **226 ms** | ✅ **ĐẠT** |
| **CN8** | Đổi mật khẩu | Khách hàng | Trần Anh Huy | Yêu cầu nhập đúng mật khẩu cũ trước khi đặt mật khẩu mới <br>`POST /api/users/change-password` | **46 ms** | ✅ **ĐẠT** |
| **CN9** | Sửa địa chỉ giao hàng | Khách hàng | Trần Anh Huy | Thêm/sửa/xóa/đặt mặc định nhiều địa chỉ nhận hàng của người dùng <br>`PUT /api/users/profile` | **40 ms** | ✅ **ĐẠT** |
| **CN10** | Danh sách thông báo | Khách hàng | Trần Anh Huy | Lấy danh sách thông báo của người dùng (user và broadcast) <br>`GET /api/users/notifications` | **143 ms** | ✅ **ĐẠT** |
| **CN11** | Đánh dấu đã đọc thông báo | Khách hàng | Nguyễn Quốc Đạt | Đánh dấu một hoặc toàn bộ thông báo đã đọc, phục vụ badge số thông báo chưa đọc <br>`PUT /api/users/notifications/read-all` | **241 ms** | ✅ **ĐẠT** |
| **CN12** | Trang chủ cửa hàng | Khách hàng | Nguyễn Quốc Đạt | Banner hero, bộ lọc danh mục/khoảng giá, flash sale đếm ngược, top bán chạy <br>`GET /api/products, /api/categories` | **894 ms** | ✅ **ĐẠT** |
| **CN13** | Tìm kiếm & lọc sản phẩm | Khách hàng | Nguyễn Quốc Đạt | Tìm theo tên/tác giả/NXB/ISBN, lọc theo danh mục phân cấp, ngôn ngữ, khoảng giá, phân trang <br>`GET /api/products` | **40 ms** | ✅ **ĐẠT** |
| **CN14** | Xem chi tiết sách | Khách hàng | Nguyễn Quốc Đạt | Hiển thị thông số sách, thư viện ảnh (zoom, chuyển ảnh), đánh giá, sách cùng chuyên mục <br>`GET /api/products/{id}` | **309 ms** | ✅ **ĐẠT** |
| **CN15** | Danh sách nhà xuất bản | Khách hàng | Nguyễn Quốc Đạt | Lấy danh sách NXB phục vụ bộ lọc và các khối sách theo nhà xuất bản <br>`GET /api/products/publishers` | **41 ms** | ✅ **ĐẠT** |
| **CN16** | Sách yêu thích (Wishlist) | Khách hàng | Nguyễn Quốc Đạt | Thêm/bỏ/xem danh sách sách yêu thích của người dùng <br>`GET /api/products/favorites` | **108 ms** | ✅ **ĐẠT** |
| **CN17** | Gợi ý sản phẩm | Khách hàng | Nguyễn Quốc Đạt | Khối Gợi ý dành cho bạn hiển thị danh sách sách gợi ý ở trang chủ, chi tiết, giỏ hàng <br>`GET /api/products?size=6` | **403 ms** | ✅ **ĐẠT** |
| **CN18** | Giỏ hàng | Khách hàng | Nguyễn Quốc Đạt | Xem giỏ, thêm sản phẩm, đổi số lượng, xóa một dòng, xóa toàn bộ, chọn từng sản phẩm <br>`GET /api/cart` | **240 ms** | ✅ **ĐẠT** |
| **CN19** | Áp mã giảm giá / dùng xu | Khách hàng | Nguyễn Quốc Đạt | Nhập mã voucher, chọn dùng điểm thưởng (1 xu = 1.000đ) và xem trước số tiền được giảm <br>`POST /api/cart/apply-coupon` | **112 ms** | ✅ **ĐẠT** |
| **CN20** | Chương trình khuyến mãi đang chạy | Khách hàng | Nguyễn Quốc Đạt | Trả về các chương trình ưu đãi/Flash Sale còn hiệu lực để hiển thị giá giảm <br>`GET /api/promotions/active` | **46 ms** | ✅ **ĐẠT** |
| **CN21** | Danh sách mã giảm giá của tôi | Khách hàng | Trần Anh Huy | Liệt kê voucher dùng chung và voucher cá nhân còn hiệu lực của người dùng <br>`GET /api/coupons` | **136 ms** | ✅ **ĐẠT** |
| **CN22** | Thanh toán / Đặt hàng | Khách hàng | Trần Anh Huy | Tạo đơn từ giỏ hàng hoặc mua ngay, trừ tồn kho, tự áp khuyến mãi tốt nhất, áp coupon <br>`POST /api/orders` | **333 ms** | ✅ **ĐẠT** |
| **CN23** | Tính phí vận chuyển | Khách hàng | Trần Anh Huy | Miễn phí ship cho đơn từ 500.000đ, còn lại tính 15k (HCM) / 25k (miền Nam) / 35k / 45k <br>`Service /api/orders/shipping-fee` | **25 ms** | ✅ **ĐẠT** |
| **CN24** | Thanh toán COD | Khách hàng | Trần Anh Huy | Ghi nhận thanh toán tiền mặt, đơn ở trạng thái chờ xử lý <br>`POST /api/orders (COD)` | **130 ms** | ✅ **ĐẠT** |
| **CN25** | Thanh toán VNPAY | Khách hàng | Trần Anh Huy | Sinh URL thanh toán VNPAY Sandbox và xử lý callback/IPN: kiểm tra chữ ký, cập nhật trạng thái <br>`GET /api/payment/vnpay-create-url` | **3 ms** | ✅ **ĐẠT** |
| **CN26** | Thanh toán bằng ví | Khách hàng | Trần Anh Huy | Kiểm tra số dư ví, trừ tiền và đánh dấu thanh toán thành công ngay <br>`POST /api/orders (WALLET)` | **79 ms** | ✅ **ĐẠT** |
| **CN27** | Trang kết quả thanh toán | Khách hàng | Trần Anh Huy | Hiển thị đang xác thực / thành công / thất bại và mã đơn sau khi quay về từ VNPAY <br>`GET /api/payment/vnpay-callback` | **0 ms** | ✅ **ĐẠT** |
| **CN28** | Lịch sử đơn hàng | Khách hàng | Trần Anh Huy | Xem toàn bộ đơn của mình, lọc theo trạng thái, xem chi tiết đơn và tiến trình giao hàng <br>`GET /api/orders` | **100 ms** | ✅ **ĐẠT** |
| **CN29** | Chi tiết đơn hàng | Khách hàng | Trần Anh Huy | Trả về đơn và danh sách sản phẩm, có kiểm tra quyền xem của người dùng <br>`GET /api/orders/{id}` | **122 ms** | ✅ **ĐẠT** |
| **CN30** | Hủy đơn hàng | Khách hàng | Trần Anh Huy | Chỉ áp dụng khi đơn Chờ xác nhận/Đã xác nhận, hoàn tồn kho và hoàn tiền vào ví nếu đã thanh toán <br>`PUT /api/orders/{id}/cancel` | **49 ms** | ✅ **ĐẠT** |
| **CN31** | Sửa địa chỉ nhận hàng | Khách hàng | Nguyễn Quốc Đạt | Cho phép đổi địa chỉ/SĐT khi đơn còn Chờ xác nhận, chặn đổi sang khu vực có phí ship khác <br>`PUT /api/orders/{id}/address` | **38 ms** | ✅ **ĐẠT** |
| **CN32** | Gửi yêu cầu đổi trả | Khách hàng | Nguyễn Quốc Đạt | Gửi đổi/trả kèm lý do, loại đổi trả, ảnh bằng chứng trong hạn 7 ngày sau khi nhận hàng <br>`POST /api/orders/{id}/return` | **105 ms** | ✅ **ĐẠT** |
| **CN33** | Phản hồi từ cửa hàng | Khách hàng | Nguyễn Quốc Đạt | Người dùng nhận thông báo khi cửa hàng trả lời đánh giá của mình <br>`WebSocket / Event Listener` | **94 ms** | ✅ **ĐẠT** |
| **CN34** | Đánh giá sản phẩm | Khách hàng | Nguyễn Quốc Đạt | Chỉ cho đơn đã giao thành công, mỗi sản phẩm/đơn 1 lần; cộng 10 xu và tặng voucher 20k <br>`POST /api/reviews` | **44 ms** | ✅ **ĐẠT** |
| **CN35** | Xem đánh giá sản phẩm | Khách hàng | Nguyễn Quốc Đạt | Lấy các đánh giá đang hiển thị của một sản phẩm kèm điểm sao trung bình <br>`GET /api/reviews/product/{id}` | **35 ms** | ✅ **ĐẠT** |
| **CN36** | Chatbot hỗ trợ khách hàng | Khách hàng | Nguyễn Quốc Đạt | Trợ lý nổi góc phải giải đáp câu hỏi về phí ship, thanh toán, coupon, xu, theo dõi đơn, đổi trả <br>`POST /api/chat/assistant` | **2 ms** | ✅ **ĐẠT** |
| **CN37** | Dashboard tổng quan Manager | Quản lý (Manager) | Nguyễn Quốc Đạt | Khung điều hướng 7 tab, kiểm tra vai trò MANAGER/ADMIN, nạp dữ liệu thống kê <br>`GET /api/users/profile` | **383 ms** | ✅ **ĐẠT** |
| **CN38** | Quản lý sản phẩm (kênh Manager) | Quản lý (Manager) | Nguyễn Quốc Đạt | Tìm kiếm theo tên/tác giả/ISBN, thêm sách, cập nhật thông tin, ảnh bìa, giá bán, danh mục <br>`GET /api/products?manager=true` | **790 ms** | ✅ **ĐẠT** |
| **CN39** | Duyệt / ẩn sản phẩm | Quản lý (Manager) | Nguyễn Quốc Đạt | Đổi trạng thái ACTIVE/INACTIVE, tự gửi thông báo cho quản trị khi sản phẩm được kích hoạt <br>`PUT /api/products/{id}/status` | **81 ms** | ✅ **ĐẠT** |
| **CN40** | Quản lý đơn hàng | Quản lý (Manager) | Nguyễn Quốc Đạt | Xem toàn bộ đơn, lọc theo trạng thái/ngày, xem chi tiết đơn <br>`GET /api/orders/all` | **803 ms** | ✅ **ĐẠT** |
| **CN41** | Cập nhật trạng thái đơn | Quản lý (Manager) | Trần Anh Huy | Chuyển trạng thái confirmed -> preparing -> shipping -> delivered, ghi mốc thời gian <br>`PUT /api/orders/{id}/status` | **38 ms** | ✅ **ĐẠT** |
| **CN42** | Đánh dấu đã giao hàng | Quản lý (Manager) | Trần Anh Huy | Đặt đơn sang delivered, ghi nhận thời điểm giao, gửi thông báo cho khách và quản trị <br>`PUT /api/orders/{id}/delivered` | **221 ms** | ✅ **ĐẠT** |
| **CN43** | Phân công Shipper | Quản lý (Manager) | Trần Anh Huy | Gán shipper cho đơn, chặn khi đơn đang giao/đã giao/đã hủy <br>`PUT /api/orders/{id}/assign-shipper` | **37 ms** | ✅ **ĐẠT** |
| **CN44** | Xử lý yêu cầu đổi trả | Quản lý (Manager) | Trần Anh Huy | Duyệt/từ chối đổi trả; duyệt thì hoàn tiền vào ví (nếu RETURN_REFUND) và hoàn tồn kho <br>`PUT /api/orders/returns/{id}` | **234 ms** | ✅ **ĐẠT** |
| **CN45** | Quản lý giao dịch kho | Quản lý (Manager) | Trần Anh Huy | Nhập kho, xuất kho, điều chỉnh tồn (tối đa 1.000.000/lần), lưu lịch sử Stock Movement <br>`GET /api/products/stock-movements` | **356 ms** | ✅ **ĐẠT** |
| **CN46** | Quản lý Shipper | Quản lý (Manager) | Trần Anh Huy | Thêm/sửa/xóa hồ sơ shipper: họ tên, SĐT, phương tiện, trạng thái hoạt động <br>`GET /api/shippers` | **247 ms** | ✅ **ĐẠT** |
| **CN47** | Kiểm duyệt & phản hồi đánh giá | Quản lý (Manager) | Trần Anh Huy | Xem tất cả đánh giá, trả lời khách, gỡ đánh giá vi phạm kèm lý do <br>`GET /api/reviews` | **240 ms** | ✅ **ĐẠT** |
| **CN48** | Ví & Doanh thu | Quản lý (Manager) | Trần Anh Huy | Thống kê doanh thu/đơn theo mốc thời gian, hiển thị số dư ví và các khoản hoàn tiền <br>`GET /api/manager/revenue` | **683 ms** | ✅ **ĐẠT** |
| **CN49** | Nhận thông báo quản trị | Quản lý (Manager) | Trần Anh Huy | Nhận thông báo đơn mới, đánh giá mới, yêu cầu đổi trả, biến động kho ngay trong dashboard <br>`WebSocket / Notifications` | **179 ms** | ✅ **ĐẠT** |
| **CN50** | Dashboard quản trị | Quản trị viên (Admin) | Trần Anh Huy | Sidebar 7 tab: Tổng quan, Người dùng, Sản phẩm, Mã giảm giá, Khuyến mãi, Doanh thu, Lịch sử <br>`GET /api/users/profile` | **390 ms** | ✅ **ĐẠT** |
| **CN51** | Tổng quan kinh doanh | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Thẻ KPI (user, sản phẩm, đơn, doanh thu), biểu đồ doanh thu theo năm/tháng/tuần, top bán chạy <br>`GET /api/admin/dashboard-stats` | **281 ms** | ✅ **ĐẠT** |
| **CN52** | Xuất báo cáo tổng quan | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Xuất file báo cáo doanh thu từ màn Tổng quan (hỗ trợ UTF-8 CSV) <br>`GET /api/admin/export/overview` | **37 ms** | ✅ **ĐẠT** |
| **CN53** | Quản lý người dùng | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Danh sách tài khoản hệ thống, tìm kiếm theo họ tên/email/SĐT, lọc vai trò (Customer/Manager/Admin) <br>`GET /api/users` | **209 ms** | ✅ **ĐẠT** |
| **CN54** | Thêm người dùng | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Tạo tài khoản mới từ quản trị, kiểm tra tính duy nhất của email và SĐT <br>`POST /api/admin/users` | **46 ms** | ✅ **ĐẠT** |
| **CN55** | Sửa người dùng | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Cập nhật họ tên, SĐT, vai trò, địa chỉ của tài khoản <br>`PUT /api/admin/users/{id}` | **208 ms** | ✅ **ĐẠT** |
| **CN56** | Khóa / mở khóa tài khoản | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Đổi trạng thái tài khoản sang LOCKED hoặc ACTIVE, chặn đăng nhập nếu bị khóa <br>`PUT /api/admin/users/{id}/status` | **47 ms** | ✅ **ĐẠT** |
| **CN57** | Xóa người dùng | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Xóa tài khoản khỏi hệ thống (chặn xóa chính mình hoặc tài khoản có liên kết ràng buộc) <br>`DELETE /api/admin/users/{id}` | **159 ms** | ✅ **ĐẠT** |
| **CN58** | Hồ sơ & mật khẩu Admin | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Quản trị viên tự xem/sửa thông tin cá nhân và đổi mật khẩu từ trang quản trị <br>`PUT /api/users/profile` | **209 ms** | ✅ **ĐẠT** |
| **CN59** | Quản lý mã giảm giá | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Danh sách mã giảm giá, tìm kiếm, sao chép mã nhanh, tạo mới, sửa, xóa <br>`GET /api/coupons` | **231 ms** | ✅ **ĐẠT** |
| **CN60** | Thiết lập mã giảm giá | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Cấu hình mã: phần trăm/số tiền cố định, giá trị giảm tối đa, đơn tối thiểu, số lượt, thời hạn <br>`POST /api/coupons` | **95 ms** | ✅ **ĐẠT** |
| **CN61** | Quản lý chương trình khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Danh sách Flash Sale/ưu đãi, tìm kiếm, lọc theo trạng thái (Đang chạy, Sắp diễn ra, Đã kết thúc) <br>`GET /api/admin/promotions` | **929 ms** | ✅ **ĐẠT** |
| **CN62** | Tạo chương trình khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Thiết lập tên chương trình, thời gian bắt đầu/kết thúc, mức giảm, danh sách sản phẩm tham gia <br>`POST /api/admin/promotions` | **51 ms** | ✅ **ĐẠT** |
| **CN63** | Sửa chương trình khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Cập nhật tên, mức giảm, thời gian, danh sách sản phẩm của chương trình <br>`PUT /api/admin/promotions/{id}` | **36 ms** | ✅ **ĐẠT** |
| **CN64** | Xem chi tiết khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Xem thông tin chi tiết chương trình, mức giảm theo từng sản phẩm, trạng thái và thời gian <br>`GET /api/admin/promotions/{id}` | **1008 ms** | ✅ **ĐẠT** |
| **CN65** | Báo cáo hiệu quả khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Thống kê số lượt mua, doanh thu tạo ra từ các sản phẩm trong chương trình khuyến mãi <br>`GET /api/admin/promotions/{id}/report` | **226 ms** | ✅ **ĐẠT** |
| **CN66** | Xóa chương trình khuyến mãi | Quản trị viên (Admin) | Trần Anh Huy | Chặn xóa khuyến mãi đang chạy để bảo toàn dữ liệu lịch sử giá, cho phép kết thúc sớm <br>`PUT /api/admin/promotions/{id}/end` | **123 ms** | ✅ **ĐẠT** |
| **CN67** | Báo cáo doanh thu | Quản trị viên (Admin) | Trần Anh Huy | Biểu đồ doanh thu theo ngày/tháng/năm, danh sách giao dịch, lọc theo khoảng thời gian và PTTT <br>`GET /api/admin/revenue` | **688 ms** | ✅ **ĐẠT** |
| **CN68** | Xuất báo cáo doanh thu | Quản trị viên (Admin) | Trần Anh Huy | Xuất file báo cáo doanh thu chi tiết ra CSV (mã hóa UTF-8 BOM, không lỗi font tiếng Việt) <br>`GET /api/admin/revenue/export` | **36 ms** | ✅ **ĐẠT** |
| **CN69** | Nhật ký kiểm toán (Audit Log) | Quản trị viên (Admin) | Trần Anh Huy | Ghi và hiển thị lịch sử thao tác: người thực hiện, hành động, bảng dữ liệu, thời điểm, IP <br>`GET /api/admin/audit-logs` | **355 ms** | ✅ **ĐẠT** |
| **CN70** | Xuất nhật ký kiểm toán | Quản trị viên (Admin) | Trần Anh Huy | Xuất danh sách nhật ký thao tác ra file CSV phục vụ kiểm toán và lưu trữ <br>`GET /api/admin/audit-logs/export` | **40 ms** | ✅ **ĐẠT** |
| **CN71** | Quản lý sản phẩm (kênh Admin) | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Quản trị viên có toàn quyền xem, thêm, sửa, xóa, duyệt sản phẩm như kênh Manager <br>`GET /api/products?admin=true` | **842 ms** | ✅ **ĐẠT** |
| **CN72** | Quản lý đơn hàng (kênh Admin) | Quản trị viên (Admin) | Nguyễn Quốc Đạt | Quản trị viên xem toàn bộ đơn hàng toàn sàn, can thiệp xử lý khi có tranh chấp <br>`GET /api/orders/all` | **665 ms** | ✅ **ĐẠT** |
| **CN73** | Bảo mật JWT & Phân quyền | Hệ thống & dùng chung | Nguyễn Quốc Đạt | JwtAuthenticationFilter chặn lọc request, kiểm tra token và quyền hạn (CUSTOMER, MANAGER, ADMIN) <br>`JwtAuthenticationFilter` | **9 ms** | ✅ **ĐẠT** |
| **CN74** | Quản lý danh mục phân cấp | Hệ thống & dùng chung | Nguyễn Quốc Đạt | Quản lý danh mục cha - con (Cây phân cấp), hỗ trợ breadcrumb, nạp danh mục điều hướng <br>`GET /api/categories` | **452 ms** | ✅ **ĐẠT** |
| **CN75** | Tải ảnh lên Cloudinary | Hệ thống & dùng chung | Trần Anh Huy | Tải ảnh bìa sách, ảnh phụ, ảnh đánh giá, ảnh bằng chứng đổi trả lên CDN Cloudinary <br>`POST /api/upload` | **996 ms** | ✅ **ĐẠT** |
| **CN76** | Gửi email OTP | Hệ thống & dùng chung | Nguyễn Quốc Đạt | Tích hợp JavaMailSender gửi email OTP xác thực tài khoản, khôi phục mật khẩu bất đồng bộ (@Async) <br>`MailService (@Async)` | **12 ms** | ✅ **ĐẠT** |
| **CN77** | Sinh và xác thực mã OTP | Hệ thống & dùng chung | Nguyễn Quốc Đạt | Sinh mã 6 chữ số ngẫu nhiên, lưu hạn dùng 5 phút, kiểm tra tính hợp lệ và hủy mã sau khi dùng <br>`OtpService / OtpTokenRepository` | **5 ms** | ✅ **ĐẠT** |
| **CN78** | Thông báo thời gian thực | Hệ thống & dùng chung | Nguyễn Quốc Đạt | Giao thức WebSocket đẩy thông báo đơn hàng mới, cập nhật giao hàng, đổi trả đến UI <br>`WebSocketHandler / Stomp` | **2 ms** | ✅ **ĐẠT** |
| **CN79** | Ghi nhật ký kiểm toán tự động | Hệ thống & dùng chung | Nguyễn Quốc Đạt | Hệ thống tự động ghi nhật ký mỗi khi phát sinh thao tác nhạy cảm (đổi trạng thái, hủy đơn, kho) <br>`AuditLogService / Repository` | **398 ms** | ✅ **ĐẠT** |
