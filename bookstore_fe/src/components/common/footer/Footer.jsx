import { Link } from "react-router-dom";
import { Globe, Share2, MessageCircle } from "lucide-react";
import { useFooter } from "./useFooter";
import "./Footer.css";

const Footer = () => {
    const { email, setEmail, handleNewsletterSubmit } = useFooter();

    return (
        <footer className="footer-container">
            <div className="footer-main-grid">
                {/* Column 1: Brand */}
                <div className="footer-col-brand">
                    <h2 className="footer-brand-title">UTEShop</h2>
                    <p className="footer-brand-desc">
                        Nơi kết nối tri thức và tình yêu sách. Chúng tôi mang
                        lại sự lựa chọn tốt nhất với các tác phẩm kinh điển và
                        hiện đại chất lượng cao.
                    </p>
                    <div className="footer-social-links-row">
                        <a
                            href="#"
                            className="footer-social-link"
                            aria-label="Website"
                        >
                            <Globe size={18} />
                        </a>
                        <a
                            href="#"
                            className="footer-social-link"
                            aria-label="Community"
                        >
                            <Share2 size={18} />
                        </a>
                        <a
                            href="#"
                            className="footer-social-link"
                            aria-label="Contact"
                        >
                            <MessageCircle size={18} />
                        </a>
                    </div>
                </div>

                {/* Column 2: Cửa hàng */}
                <div className="footer-col-nav">
                    <h3 className="footer-col-heading">Cửa hàng</h3>
                    <Link to="/" className="footer-nav-link">
                        Về chúng tôi
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Hệ thống cửa hàng
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Tuyển dụng
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Tin tức
                    </Link>
                </div>

                {/* Column 3: Hỗ trợ */}
                <div className="footer-col-nav">
                    <h3 className="footer-col-heading">Hỗ trợ</h3>
                    <Link to="/" className="footer-nav-link">
                        Vận chuyển & Giao nhận
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Thanh toán an toàn
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Chính sách bảo mật
                    </Link>
                    <Link to="/" className="footer-nav-link">
                        Điều khoản dịch vụ
                    </Link>
                </div>

                {/* Column 4: Newsletter */}
                <div className="footer-col-newsletter">
                    <h3 className="footer-col-heading">Đăng ký bản tin</h3>
                    <p className="footer-newsletter-desc">
                        Nhận thông tin cập nhật về các đầu sách mới và sự kiện
                        khuyến mại đặc biệt.
                    </p>
                    <form
                        onSubmit={handleNewsletterSubmit}
                        className="footer-newsletter-form"
                    >
                        <input
                            type="email"
                            placeholder="Email của bạn..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="footer-newsletter-input"
                        />
                        <button type="submit" className="footer-newsletter-btn">
                            Gửi
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="footer-bottom-bar">
                <span>
                    © 2024 UTEShop. Bảo lưu mọi quyền. Thiết kế và Phát triển
                    bởi Bookstore.
                </span>
                <div className="footer-bottom-contact">
                    <span>Hotline: 1900 1234 (8:00 - 21:00)</span>
                    <span>Email: support@uteshop.vn</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
