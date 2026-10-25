/**
 * Dữ liệu tri thức cho Chatbot hỗ trợ khách hàng.
 * Toàn bộ nội dung được đối chiếu trực tiếp từ mã nguồn:
 *  - Phí vận chuyển: OrderService.calculateShippingFee (bookstore_be)
 *  - Freeship: đơn từ 500.000đ (useCart / useCheckout)
 *  - Xu tích lũy: 1 xu = 1.000đ, +10 xu khi đánh giá (CouponsRewards, ReviewService)
 *  - Đổi trả: trong 07 ngày kể từ khi nhận hàng (OrderService.requestReturn)
 *  - Thanh toán: COD / VNPAY Sandbox / Ví (wallet)
 *  - OTP: mã 6 chữ số, hiệu lực 5 phút
 */

export const FAQ_DATA = [
    {
        id: "shipping-fee",
        question: "Phí vận chuyển bao nhiêu?",
        keywords: [
            "phí vận chuyển",
            "phi van chuyen",
            "ship bao nhiêu",
            "phí ship",
            "phi ship",
            "tiền ship",
            "tien ship",
            "cước",
            "cuoc",
            "giao hàng",
            "giao hang",
        ],
        icon: "truck",
        answer: [
            "Phí giao hàng được tính tự động dựa trên địa chỉ nhận hàng của bạn:",
            "• Nội tỉnh TP.HCM: 15.000đ",
            "• Miền Nam & lân cận (Bình Dương, Đồng Nai, Cần Thơ, Long An...): 25.000đ",
            "• Miền Bắc (Hà Nội, Hải Phòng, Quảng Ninh...): 45.000đ",
            "• Miền Trung & Tây Nguyên: 35.000đ",
            "Lưu ý: Đơn hàng từ 500.000đ được miễn phí vận chuyển toàn quốc.",
        ],
        links: [{ label: "Đi tới giỏ hàng", to: "/cart" }],
    },
    {
        id: "freeship",
        question: "Khi nào được freeship?",
        keywords: [
            "freeship",
            "free ship",
            "miễn phí vận chuyển",
            "mien phi van chuyen",
            "miễn ship",
            "mien ship",
            "500.000",
            "500000",
            "500k",
        ],
        icon: "truck",
        answer: [
            "Bookstore miễn phí vận chuyển toàn quốc cho mọi đơn hàng có giá trị từ 500.000đ trở lên.",
            "Ngoài ra, bạn có thể dùng mã giảm giá loại Freeship (ví dụ: FREESHIP) để được trừ trực tiếp vào phí giao hàng — mã này áp dụng cho đơn từ 150.000đ.",
            "Trong trang Giỏ hàng có thanh tiến độ freeship giúp bạn biết còn cần mua thêm bao nhiêu để được miễn phí ship.",
        ],
        links: [
            { label: "Xem sách để mua thêm", to: "/catalog" },
            { label: "Giỏ hàng của tôi", to: "/cart" },
        ],
    },
    {
        id: "payment-methods",
        question: "Có những hình thức thanh toán nào?",
        keywords: [
            "thanh toán",
            "thanh toan",
            "payment",
            "cod",
            "vnpay",
            "chuyển khoản",
            "chuyen khoan",
            "trả tiền",
            "tra tien",
            "ví",
            "vi điện tử",
        ],
        icon: "wallet",
        answer: [
            "Hệ thống hỗ trợ 3 hình thức thanh toán:",
            "1. COD – Thanh toán khi nhận hàng: kiểm tra sách rồi mới trả tiền cho shipper.",
            "2. VNPAY Sandbox – Thanh toán trực tuyến qua cổng VNPAY, sau khi hoàn tất hệ thống tự động cập nhật trạng thái đơn hàng.",
            "3. Ví điện tử – Dùng số dư ví tích lũy trong tài khoản (ví dụ khi được hoàn tiền đơn hủy).",
            "Mọi giao dịch đều được bảo mật và có thông báo trạng thái thanh toán theo thời gian thực.",
        ],
        links: [{ label: "Đi tới thanh toán", to: "/checkout" }],
    },
    {
        id: "coupon",
        question: "Làm sao áp dụng mã giảm giá?",
        keywords: [
            "mã giảm giá",
            "ma giam gia",
            "coupon",
            "voucher",
            "khuyến mãi",
            "khuyen mai",
            "mã giảm",
            "giam gia",
            "flash sale",
            "khuyến mại",
        ],
        icon: "tag",
        answer: [
            "Bạn có thể áp dụng mã giảm giá ngay tại trang Giỏ hàng hoặc trang Thanh toán.",
            "Hệ thống tự động gợi ý và áp dụng mã (Best Coupon) có lợi nhất cho đơn hàng của bạn, đồng thời cho phép nhập mã thủ công.",
            "Mỗi mã có điều kiện riêng: loại giảm (phần trăm / số tiền cố định / freeship), giá trị đơn tối thiểu, mức giảm tối đa và hạn sử dụng.",
            "Xem toàn bộ mã đang có tại mục “Ưu đãi & Xu” trong trang tài khoản.",
        ],
        links: [{ label: "Xem mã ưu đãi của tôi", to: "/profile" }],
    },
    {
        id: "rewards",
        question: "Xu tích lũy dùng như thế nào?",
        keywords: [
            "xu",
            "điểm thưởng",
            "diem thuong",
            "tích điểm",
            "tich diem",
            "reward",
            "rewardpoints",
            "quy đổi điểm",
            "xu tích lũy",
        ],
        icon: "coins",
        answer: [
            "Mỗi 1 xu tương đương 1.000đ khi thanh toán — bạn có thể trừ xu trực tiếp vào hóa đơn.",
            "Cách nhận xu: đánh giá sản phẩm sau khi đơn hàng đã giao thành công (mỗi đánh giá được cộng 10 xu).",
            "Cách dùng: tại trang Thanh toán, tích chọn “Dùng xu” để hệ thống trừ tối đa số xu bạn đang có.",
            "Số xu hiện tại được hiển thị trong trang Hồ sơ cá nhân, mục Ưu đãi & Xu.",
        ],
        links: [{ label: "Xem số xu của tôi", to: "/profile" }],
    },
    {
        id: "track-order",
        question: "Làm sao theo dõi đơn hàng?",
        keywords: [
            "theo dõi đơn",
            "theo doi don",
            "kiểm tra đơn",
            "kiem tra don",
            "trạng thái đơn",
            "trang thai don",
            "đơn hàng của tôi",
            "tra cứu đơn",
            "đơn đang ở đâu",
            "shipper",
        ],
        icon: "package",
        answer: [
            "Vào trang “Đơn hàng của tôi” để theo dõi lộ trình đơn hàng theo thời gian thực. Các trạng thái gồm:",
            "Chờ xác nhận → Đã xác nhận → Đang đóng gói → Đang giao hàng → Đã giao thành công.",
            "Khi đơn được phân công cho shipper, bạn sẽ thấy tên và số điện thoại của người giao hàng.",
            "Bạn cũng nhận thông báo (chuông ở góc phải) mỗi khi đơn chuyển trạng thái.",
        ],
        links: [{ label: "Theo dõi đơn hàng", to: "/orders" }],
    },
    {
        id: "return-policy",
        question: "Chính sách đổi trả ra sao?",
        keywords: [
            "đổi trả",
            "doi tra",
            "trả hàng",
            "tra hang",
            "hoàn tiền",
            "hoan tien",
            "return",
            "bảo hành",
            "sách lỗi",
            "sách hỏng",
        ],
        icon: "rotate",
        answer: [
            "Bạn được yêu cầu đổi / trả hàng trong vòng 07 ngày kể từ khi nhận hàng.",
            "Điều kiện: đơn hàng đã giao thành công, mỗi đơn chỉ được gửi yêu cầu đổi trả một lần.",
            "Cách thực hiện: mở “Đơn hàng của tôi” → chọn đơn đã giao → bấm “Yêu cầu đổi trả”, chọn đổi/trả, nhập lý do và đính kèm ảnh minh chứng lỗi.",
            "Yêu cầu sẽ được bộ phận quản lý duyệt. Nếu được chấp nhận, đơn chuyển sang trạng thái “Đã hoàn tiền” và kho được cập nhật lại.",
        ],
        links: [{ label: "Tạo yêu cầu đổi trả", to: "/orders" }],
    },
    {
        id: "cancel-order",
        question: "Tôi có thể hủy đơn hàng không?",
        keywords: [
            "hủy đơn",
            "huy don",
            "hủy hàng",
            "cancel",
            "không mua nữa",
            "muốn hủy",
        ],
        icon: "x-circle",
        answer: [
            "Bạn có thể hủy đơn hàng khi đơn đang ở trạng thái “Chờ xác nhận” hoặc “Đã xác nhận”.",
            "Khi đơn đã chuyển sang giao hàng (đã có shipper) thì không thể tự hủy — vui lòng liên hệ hotline 1900 1234 để được hỗ trợ.",
            "Sau khi hủy, số lượng sách sẽ được tự động hoàn lại kho. Nếu đơn đã thanh toán trước (VNPAY), tiền được hoàn về ví điện tử trong tài khoản.",
        ],
        links: [{ label: "Quản lý đơn hàng", to: "/orders" }],
    },
    {
        id: "review",
        question: "Làm sao để đánh giá sản phẩm?",
        keywords: [
            "đánh giá",
            "danh gia",
            "review",
            "nhận xét",
            "nhan xet",
            "chấm sao",
            "sao",
            "bình luận",
        ],
        icon: "star",
        answer: [
            "Bạn chỉ có thể đánh giá sách sau khi đơn hàng đã được giao thành công.",
            "Cách làm: vào “Đơn hàng của tôi” → chọn đơn đã giao → bấm “Đánh giá” cho từng sản phẩm, chọn số sao và viết nhận xét.",
            "Mỗi sản phẩm trong một đơn chỉ được đánh giá một lần.",
            "Đánh giá hợp lệ sẽ được cộng 10 xu vào tài khoản và nhận thêm một mã giảm giá ưu đãi.",
        ],
        links: [{ label: "Đi tới đơn hàng", to: "/orders" }],
    },
    {
        id: "account-security",
        question: "Quên mật khẩu thì phải làm sao?",
        keywords: [
            "quên mật khẩu",
            "quen mat khau",
            "đổi mật khẩu",
            "doi mat khau",
            "otp",
            "mã xác thực",
            "đăng ký",
            "dang ky",
            "tài khoản",
            "kích hoạt",
            "email",
        ],
        icon: "lock",
        answer: [
            "Tại trang Đăng nhập, chọn “Quên mật khẩu” và nhập email đã đăng ký.",
            "Hệ thống gửi mã OTP gồm 6 chữ số về email, mã có hiệu lực trong 5 phút.",
            "Nhập đúng OTP để đặt lại mật khẩu mới, sau đó đăng nhập lại bình thường.",
            "Lưu ý: khi đăng ký mới, tài khoản chỉ hoạt động sau khi bạn xác thực OTP qua email. Bạn cũng có thể đổi mật khẩu bất cứ lúc nào tại mục Cài đặt bảo mật trong trang cá nhân.",
        ],
        links: [
            { label: "Đăng nhập / Quên mật khẩu", to: "/login" },
            { label: "Cài đặt bảo mật", to: "/profile" },
        ],
    },
];

export const GREETING =
    "Xin chào! Mình là trợ lý ảo của Bookstore. Bạn cần hỗ trợ về vấn đề gì?";

export const SUGGESTED_QUESTION_COUNT = 4;

/** Chuẩn hóa tiếng Việt có dấu/không dấu để so khớp linh hoạt. */
export const normalizeText = (text = "") =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

/**
 * Tìm câu trả lời phù hợp nhất dựa trên điểm trùng khớp từ khóa.
 * Trả về null nếu không đủ tự tin.
 */
export const findBestAnswer = (input) => {
    const normalized = normalizeText(input);
    if (!normalized) return null;

    let bestMatch = null;
    let bestScore = 0;

    FAQ_DATA.forEach((item) => {
        let score = 0;
        item.keywords.forEach((keyword) => {
            const normalizedKeyword = normalizeText(keyword);
            if (!normalizedKeyword) return;
            if (normalized.includes(normalizedKeyword)) {
                // Từ khóa dài và cụ thể hơn được ưu tiên
                score += normalizedKeyword.includes(" ")
                    ? 3
                    : normalizedKeyword.length >= 6
                      ? 2
                      : 1;
            }
        });
        // Khớp với chính câu hỏi mẫu
        if (normalizeText(item.question) === normalized) score += 5;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    });

    return bestScore >= 2 ? bestMatch : null;
};
