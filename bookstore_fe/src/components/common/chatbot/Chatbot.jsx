import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    MessageCircle,
    X,
    Send,
    Headset,
    RotateCcw,
    ArrowRight,
    Truck,
    Wallet,
    Tag,
    Coins,
    Package,
    RotateCcw as ReturnIcon,
    XCircle,
    Star,
    Lock,
    Bot,
} from "lucide-react";
import { GREETING, SUGGESTED_QUESTION_COUNT } from "./chatbotData";
import { useChatbot } from "./useChatbot";
import "./Chatbot.css";

const TOPIC_ICONS = {
    truck: Truck,
    wallet: Wallet,
    tag: Tag,
    coins: Coins,
    package: Package,
    rotate: ReturnIcon,
    "x-circle": XCircle,
    star: Star,
    lock: Lock,
};

const Chatbot = () => {
    const {
        isOpen,
        messages,
        isTyping,
        unreadCount,
        suggestions,
        close,
        toggle,
        resetChat,
        sendMessage,
        handleSuggestionClick,
        allQuestions,
    } = useChatbot();

    const [draft, setDraft] = useState("");
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (!isOpen) return;
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, isTyping, isOpen, showAllQuestions]);

    // Focus ô nhập khi mở khung chat
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 250);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Đóng khung chat bằng phím Esc
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, close]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        sendMessage(draft);
        setDraft("");
    };

    const remainingTopics = allQuestions.slice(SUGGESTED_QUESTION_COUNT);

    return (
        <div className="chatbot-root">
            {/* ===== KHUNG TRÒ CHUYỆN ===== */}
            {isOpen && (
                <div
                    className="chatbot-window"
                    role="dialog"
                    aria-label="Trợ lý ảo Bookstore"
                >
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-avatar">
                            <Headset size={20} />
                        </div>
                        <div className="chatbot-header-info">
                            <h3 className="chatbot-header-title">
                                Trợ lý Bookstore
                            </h3>
                            <span className="chatbot-header-status">
                                <span className="chatbot-status-dot" />
                                Trực tuyến • Hỗ trợ 24/7
                            </span>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                type="button"
                                className="chatbot-icon-btn"
                                onClick={resetChat}
                                aria-label="Bắt đầu lại cuộc trò chuyện"
                                title="Bắt đầu lại"
                            >
                                <RotateCcw size={17} />
                            </button>
                            <button
                                type="button"
                                className="chatbot-icon-btn"
                                onClick={close}
                                aria-label="Đóng trò chuyện"
                                title="Đóng"
                            >
                                <X size={19} />
                            </button>
                        </div>
                    </div>

                    {/* Nội dung tin nhắn */}
                    <div className="chatbot-body">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chatbot-msg-row chatbot-msg-row-${msg.sender}`}
                            >
                                {msg.sender === "bot" && (
                                    <div className="chatbot-msg-avatar">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div
                                    className={`chatbot-bubble chatbot-bubble-${msg.sender}`}
                                >
                                    <p className="chatbot-bubble-text">
                                        {msg.text}
                                    </p>
                                    {msg.links?.length > 0 && (
                                        <div className="chatbot-bubble-links">
                                            {msg.links.map((link) => (
                                                <Link
                                                    key={link.to + link.label}
                                                    to={link.to}
                                                    className="chatbot-bubble-link"
                                                    onClick={close}
                                                >
                                                    {link.label}
                                                    <ArrowRight size={13} />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chatbot-msg-row chatbot-msg-row-bot">
                                <div className="chatbot-msg-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Câu hỏi gợi ý */}
                    <div className="chatbot-suggestions">
                        <div className="chatbot-suggestions-label">
                            {showAllQuestions
                                ? "Tất cả chủ đề hỗ trợ"
                                : "Câu hỏi thường gặp"}
                        </div>
                        <div className="chatbot-suggestions-list">
                            {(showAllQuestions
                                ? allQuestions
                                : suggestions
                            ).map((item) => {
                                const Icon = TOPIC_ICONS[item.icon] || Tag;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="chatbot-suggestion-chip"
                                        onClick={() =>
                                            handleSuggestionClick(item)
                                        }
                                        disabled={isTyping}
                                    >
                                        <Icon
                                            size={14}
                                            className="chatbot-suggestion-icon"
                                        />
                                        <span>{item.question}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {remainingTopics.length > 0 && (
                            <button
                                type="button"
                                className="chatbot-see-all-btn"
                                onClick={() =>
                                    setShowAllQuestions((prev) => !prev)
                                }
                            >
                                {showAllQuestions
                                    ? "Thu gọn"
                                    : `Xem tất cả ${allQuestions.length} câu hỏi`}
                            </button>
                        )}
                    </div>

                    {/* Ô nhập câu hỏi */}
                    <form
                        className="chatbot-input-area"
                        onSubmit={handleSubmit}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            className="chatbot-input"
                            aria-label="Nhập câu hỏi"
                            maxLength={300}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!draft.trim() || isTyping}
                            aria-label="Gửi câu hỏi"
                        >
                            <Send size={17} />
                        </button>
                    </form>
                    <div className="chatbot-footer-note">
                        Trợ lý tự động — Hotline 1900 1234 (8:00 – 21:00)
                    </div>
                </div>
            )}

            {/* ===== NÚT NỔI GÓC PHẢI DƯỚI ===== */}
            <button
                type="button"
                className={`chatbot-fab ${isOpen ? "is-open" : ""}`}
                onClick={toggle}
                aria-label={isOpen ? "Đóng trợ lý ảo" : "Mở trợ lý ảo"}
                title={isOpen ? "Đóng trợ lý ảo" : "Trợ lý ảo Bookstore"}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
                {!isOpen && unreadCount > 0 && (
                    <span className="chatbot-fab-badge">{unreadCount}</span>
                )}
                {!isOpen && (
                    <span className="chatbot-fab-tooltip">{GREETING}</span>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
