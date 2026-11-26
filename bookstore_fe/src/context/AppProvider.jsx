import {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import api from "../services/api";
import { AppContext } from "./AppContext";
import {
    applyMarkAllNotificationsRead,
    applyMarkNotificationRead,
    buildNotificationWsUrl,
    getRealtimeNotificationActions,
} from "./notificationRealtime";

const readSavedUser = () => {
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!savedUser || !token) return null;
    try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
    } catch {
        // Ignore corrupted JSON in storage and clear it below
    }
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
};

const getGuestCart = () => {
    try {
        const local = localStorage.getItem("guestCart");
        if (!local) return { items: [] };
        const parsed = JSON.parse(local);
        if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
        const validItems = parsed.items
            .filter((item) => item && item.product && typeof item.product === "object")
            .map((item) => ({
                id: item.id || `guest-${item.product.id || Date.now()}`,
                product: item.product,
                quantity: Number(item.quantity) || 1,
            }));
        return { items: validItems };
    } catch {
        return { items: [] };
    }
};

const saveGuestCart = (guestCartObj) => {
    try {
        const sanitizedItems = (guestCartObj?.items || []).filter(
            (item) => item && item.product && typeof item.product === "object",
        );
        localStorage.setItem("guestCart", JSON.stringify({ items: sanitizedItems }));
    } catch (e) {
        console.error("Failed to save guest cart", e);
    }
};

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => readSavedUser());
    const [cart, setCart] = useState(() => getGuestCart());
    const [notifications, setNotifications] = useState([]);
    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications],
    );
    const [favorites, setFavorites] = useState([]);
    const [loading] = useState(false);
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

    const userId = user?.id ?? null;

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const updateUser = useCallback((newUserData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newUserData };
            const isRemembered = localStorage.getItem("rememberMe") === "true";
            const storage = isRemembered ? localStorage : sessionStorage;
            storage.setItem("user", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const reloadUserProfile = useCallback(async () => {
        if (!localStorage.getItem("token") && !sessionStorage.getItem("token")) return;
        try {
            const response = await api.get("/users/profile");
            updateUser(response.data);
        } catch (error) {
            console.error("Failed to reload user profile:", error);
        }
    }, [updateUser]);

    const fetchCart = useCallback(async () => {
        if (!userId) {
            setCart(getGuestCart());
            return;
        }
        try {
            const response = await api.get("/cart");
            setCart({
                items: response.data.items || [],
            });
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    }, [userId]);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const notifResponse = await api
                .get("/users/notifications")
                .catch(() => ({ data: [] }));
            const list = notifResponse.data || [];
            setNotifications(list);
        } catch {
            console.warn(
                "Notification endpoint not found/configured, fallback to empty list",
            );
        }
    }, [userId]);

    const fetchFavorites = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await api.get("/products/favorites");
            setFavorites(response.data || []);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
    }, [userId]);

    // Backfill profile details if stored session is missing fullName
    useEffect(() => {
        if (user && !user.fullName && user.email) {
            api.get("/users/profile")
                .then((res) => updateUser(res.data || {}))
                .catch(() => {});
        }
    }, [user, updateUser]);

    // Listen to expired auth session
    useEffect(() => {
        const handleAuthExpired = () => {
            setUser(null);
            setCart({ items: [] });
            setNotifications([]);
            showToast(
                "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.",
                "error",
            );
        };
        window.addEventListener("auth-expired", handleAuthExpired);
        return () =>
            window.removeEventListener("auth-expired", handleAuthExpired);
    }, [showToast]);

    // Load cart and notifications when user logs in or is guest
    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (!active) return;
            if (userId) {
                if (user && !Object.prototype.hasOwnProperty.call(user, "phone")) {
                    reloadUserProfile();
                }
                fetchCart();
                fetchNotifications();
                fetchFavorites();
            } else {
                fetchCart();
            }
        });
        return () => {
            active = false;
        };
    }, [userId, user, reloadUserProfile, fetchCart, fetchNotifications, fetchFavorites]);

    // Real-time WebSocket Notifications
    useEffect(() => {
        if (!userId) return;

        const wsUrl = buildNotificationWsUrl(
            import.meta.env.VITE_API_BASE_URL,
            window.location.protocol,
            window.location.host,
        );

        let ws;
        let reconnectTimeout;

        const connect = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connected to notification service");
            };

            ws.onmessage = (event) => {
                try {
                    const newNotif = JSON.parse(event.data);
                    const { shouldDeliver, events } =
                        getRealtimeNotificationActions(newNotif, user);

                    if (shouldDeliver) {
                        setNotifications((prev) => [newNotif, ...prev]);
                        showToast(
                            newNotif.title + ": " + newNotif.message,
                            "info",
                        );
                    }

                    events.forEach(({ name, detail }) => {
                        window.dispatchEvent(new CustomEvent(name, { detail }));
                    });
                } catch (err) {
                    console.error("Error processing websocket message:", err);
                }
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected. Reconnecting...");
                reconnectTimeout = setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                ws.close();
            };
        };

        connect();

        return () => {
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [userId, user, showToast]);

    // Ghi nhận phiên đăng nhập ngay khi vừa login. Phải chạy TRƯỚC mọi request
    // cần xác thực để request interceptor gắn được Bearer token.
    const persistAuthSession = (token, userData, rememberMe = false) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("rememberMe");
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", token);
        storage.setItem("user", JSON.stringify(userData));
        storage.setItem("rememberMe", rememberMe ? "true" : "false");
    };

    const syncGuestCartToBackend = async () => {
        const guestCartObj = getGuestCart();
        if (guestCartObj.items && guestCartObj.items.length > 0) {
            for (const item of guestCartObj.items) {
                if (item.product?.id) {
                    try {
                        await api.post(
                            `/cart/add?productId=${item.product.id}&quantity=${item.quantity}`,
                        );
                    } catch (e) {
                        console.error("Error syncing guest item to backend cart", e);
                    }
                }
            }
        }
        localStorage.removeItem("guestCart");
    };

    const loginUser = async (token, userData, rememberMe = false) => {
        persistAuthSession(token, userData, rememberMe);
        await syncGuestCartToBackend();
        setUser((prev) => ({ ...prev, ...userData }));
        // Đồng bộ ngay giỏ hàng server vừa nhận thay vì phải tải lại trang
        if (userData?.id) {
            try {
                const response = await api.get("/cart");
                setCart({ items: response.data.items || [] });
            } catch (error) {
                console.error("Failed to fetch cart after login:", error);
            }
        }
    };

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("rememberMe");
        localStorage.removeItem("guestCart");
        setUser(null);
        setCart({ items: [] });
        setNotifications([]);
    };

    const addToCart = async (productId, quantity = 1, productSnapshot = null) => {
        if (!user) {
            try {
                let targetProd = productSnapshot;
                if (!targetProd) {
                    const prodRes = await api.get(`/products/${productId}`);
                    targetProd = prodRes.data;
                }
                const currentGuest = getGuestCart();
                const existingIdx = (currentGuest.items || []).findIndex(
                    (i) => String(i.product?.id) === String(productId),
                );
                if (existingIdx >= 0) {
                    currentGuest.items[existingIdx].quantity += quantity;
                } else {
                    currentGuest.items.push({
                        id: `guest-${productId}`,
                        product: targetProd,
                        quantity: quantity,
                    });
                }
                saveGuestCart(currentGuest);
                setCart({ items: [...currentGuest.items] });
                showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
                return true;
            } catch (err) {
                console.error("Failed guest addToCart", err);
                showToast("Không thể thêm sản phẩm vào giỏ hàng", "error");
                return false;
            }
        }
        try {
            await api.post(
                `/cart/add?productId=${productId}&quantity=${quantity}`,
            );
            await fetchCart();
            showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
            return true;
        } catch (error) {
            const msg =
                error.response?.data?.error ||
                "Không thể thêm sản phẩm vào giỏ hàng";
            showToast(msg, "error");
            return false;
        }
    };

    const updateCartQty = async (productId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        if (!user) {
            const currentGuest = getGuestCart();
            const item = (currentGuest.items || []).find(
                (i) =>
                    String(i.product?.id) === String(productId) ||
                    String(i.id) === String(productId),
            );
            if (item) {
                item.quantity = quantity;
                saveGuestCart(currentGuest);
                setCart({ items: [...currentGuest.items] });
            }
            return;
        }

        const previousCart = cart;
        setCart((prev) => {
            if (!prev || !prev.items) return prev;
            return {
                ...prev,
                items: prev.items.map((i) => {
                    if (
                        String(i.product?.id) === String(productId) ||
                        String(i.id) === String(productId)
                    ) {
                        return { ...i, quantity };
                    }
                    return i;
                }),
            };
        });

        try {
            await api.patch(
                `/cart/update?productId=${productId}&quantity=${quantity}`,
            );
        } catch (error) {
            console.error("Failed to update cart quantity:", error);
            setCart(previousCart);
            await fetchCart();
            const msg =
                error.response?.data?.error || "Không thể cập nhật số lượng";
            showToast(msg, "error");
        }
    };

    const removeFromCart = async (productId) => {
        if (!productId) return;
        if (!user) {
            const currentGuest = getGuestCart();
            currentGuest.items = (currentGuest.items || []).filter(
                (i) =>
                    String(i.product?.id) !== String(productId) &&
                    String(i.id) !== String(productId),
            );
            saveGuestCart(currentGuest);
            setCart({ items: [...currentGuest.items] });
            showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
            return;
        }

        const previousCart = cart;
        setCart((prev) => {
            if (!prev || !prev.items) return prev;
            return {
                ...prev,
                items: prev.items.filter(
                    (i) =>
                        String(i.product?.id) !== String(productId) &&
                        String(i.id) !== String(productId),
                ),
            };
        });
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");

        try {
            await api.delete(`/cart/remove/${productId}`);
        } catch (error) {
            console.error("Failed to remove item:", error);
            setCart(previousCart);
            await fetchCart();
            showToast(
                error.response?.data?.error || "Không thể xóa sản phẩm khỏi giỏ hàng",
                "error",
            );
        }
    };

    const clearCart = async () => {
        if (!user) {
            localStorage.removeItem("guestCart");
            setCart({ items: [] });
            showToast("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng", "success");
            return;
        }

        const previousCart = cart;
        setCart({ items: [] });
        showToast("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng", "success");

        try {
            await api.delete("/cart/clear");
        } catch (error) {
            console.error("Failed to clear cart:", error);
            setCart(previousCart);
            await fetchCart();
            showToast("Không thể xóa giỏ hàng", "error");
        }
    };

    const markNotificationRead = async (id) => {
        setNotifications((prev) =>
            applyMarkNotificationRead(prev, id).notifications,
        );
        try {
            await api.put(`/users/notifications/${id}/read`);
        } catch {
            await fetchNotifications();
        }
    };

    const markAllNotificationsAsRead = async () => {
        setNotifications((prev) =>
            applyMarkAllNotificationsRead(prev).notifications,
        );
        try {
            await api.put("/users/notifications/read-all");
        } catch {
            await fetchNotifications();
        }
    };

    const addFavorite = async (productId) => {
        try {
            await api.post(`/products/favorites?productId=${productId}`);
            const res = await api.get("/products/favorites");
            setFavorites(res.data || []);
            showToast?.("Đã thêm vào danh sách yêu thích", "success");
        } catch {
            showToast?.(
                "Không thể thêm vào yêu thích. Vui lòng đăng nhập!",
                "error",
            );
        }
    };

    const removeFavorite = async (productId) => {
        try {
            await api.delete(`/products/favorites?productId=${productId}`);
            setFavorites((prev) =>
                prev.filter((f) => f.product?.id !== productId),
            );
            showToast?.("Đã xóa khỏi danh sách yêu thích", "info");
        } catch {
            showToast?.("Lỗi khi xóa khỏi yêu thích", "error");
        }
    };

    return (
        <AppContext.Provider
            value={{
                user,
                updateUser,
                reloadUserProfile,
                cart,
                notifications,
                unreadCount,
                loading,
                loginUser,
                logoutUser,
                fetchCart,
                addToCart,
                updateCartQty,
                removeFromCart,
                clearCart,
                fetchNotifications,
                markNotificationRead,
                markAllNotificationsAsRead,
                favorites,
                fetchFavorites,
                addFavorite,
                removeFavorite,
                toast,
                showToast,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
