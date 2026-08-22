import { useState } from "react";
import { useApp } from "@/context/AppContext";

export const useFooter = () => {
    const { showToast } = useApp();
    const [email, setEmail] = useState("");

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        showToast("Cảm ơn bạn đã đăng ký bản tin!", "success");
        setEmail("");
    };

    return {
        email,
        setEmail,
        handleNewsletterSubmit,
    };
};
