import { useCallback, useEffect, useRef, useState } from "react";
import {
    FAQ_DATA,
    GREETING,
    SUGGESTED_QUESTION_COUNT,
    findBestAnswer,
} from "./chatbotData";

let messageId = 0;
const nextId = () => `msg-${Date.now()}-${messageId++}`;

const buildWelcomeMessage = () => ({
    id: nextId(),
    sender: "bot",
    text: GREETING,
});

/**
 * Quản lý trạng thái hội thoại của chatbot: mở/đóng, danh sách tin nhắn,
 * câu hỏi gợi ý và logic trả lời dựa trên bộ dữ liệu FAQ có sẵn.
 */
export const useChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => [buildWelcomeMessage()]);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [suggestions, setSuggestions] = useState(() =>
        FAQ_DATA.slice(0, SUGGESTED_QUESTION_COUNT),
    );

    const timersRef = useRef([]);

    // Dọn dẹp timer khi component unmount
    useEffect(
        () => () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        },
        [],
    );

    const pushBotMessage = useCallback((text, links = []) => {
        setMessages((prev) => [
            ...prev,
            { id: nextId(), sender: "bot", text, links },
        ]);
    }, []);

    const open = useCallback(() => {
        setIsOpen(true);
        setUnreadCount(0);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    const toggle = useCallback(() => {
        setIsOpen((prev) => {
            if (!prev) setUnreadCount(0);
            return !prev;
        });
    }, []);

    const resetChat = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setIsTyping(false);
        setMessages([buildWelcomeMessage()]);
        setSuggestions(FAQ_DATA.slice(0, SUGGESTED_QUESTION_COUNT));
    }, []);

    /**
     * Gửi câu hỏi của người dùng.
     * @param {string} rawText câu hỏi người dùng nhập
     * @param {object} faqItem câu hỏi mẫu (nếu bấm từ danh sách gợi ý)
     */
    const sendMessage = useCallback(
        (rawText, faqItem = null) => {
            const text = (rawText || "").trim();
            if (!text || isTyping) return;

            setMessages((prev) => [
                ...prev,
                { id: nextId(), sender: "user", text },
            ]);
            setIsTyping(true);

            const match = faqItem || findBestAnswer(text);
            // Hiển thị trạng thái "đang nhập" một nhịp ngắn cho tự nhiên
            const delay = 500 + Math.min(text.length * 8, 500);

            const timer = setTimeout(() => {
                setIsTyping(false);

                if (match) {
                    pushBotMessage(match.answer.join("\n"), match.links || []);
                    setSuggestions(
                        FAQ_DATA.filter((item) => item.id !== match.id).slice(
                            0,
                            SUGGESTED_QUESTION_COUNT,
                        ),
                    );
                } else {
                    pushBotMessage(
                        [
                            "Xin lỗi, mình chưa có câu trả lời cho câu hỏi này.",
                            "Bạn thử chọn một trong các chủ đề gợi ý bên dưới nhé — hoặc liên hệ hotline 1900 1234 (8:00 – 21:00) / support@bookstore.vn để được hỗ trợ trực tiếp.",
                        ].join("\n"),
                        [{ label: "Xem tất cả sách", to: "/catalog" }],
                    );
                    setSuggestions(FAQ_DATA.slice(0, SUGGESTED_QUESTION_COUNT));
                }

                setUnreadCount((prev) => (isOpen ? prev : prev + 1));
            }, delay);

            timersRef.current.push(timer);
        },
        [isTyping, isOpen, pushBotMessage],
    );

    const handleSuggestionClick = useCallback(
        (faqItem) => sendMessage(faqItem.question, faqItem),
        [sendMessage],
    );

    return {
        isOpen,
        messages,
        isTyping,
        unreadCount,
        suggestions,
        open,
        close,
        toggle,
        resetChat,
        sendMessage,
        handleSuggestionClick,
        allQuestions: FAQ_DATA,
    };
};
