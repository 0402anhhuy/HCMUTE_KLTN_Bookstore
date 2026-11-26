/**
 * Helpers for real-time WebSocket notification routing and optimistic read updates.
 */

export function buildNotificationWsUrl(
    apiBaseUrl = "",
    locationProtocol = "http:",
    locationHost = "localhost:8081",
) {
    const raw = (apiBaseUrl || "").trim();
    if (raw && /^https?:\/\//i.test(raw)) {
        const cleaned = raw.replace(/\/api\/v1\/?$/i, "").replace(/\/+$/, "");
        const wsOrigin = cleaned
            .replace(/^https:\/\//i, "wss://")
            .replace(/^http:\/\//i, "ws://");
        return `${wsOrigin}/ws/notifications`;
    }
    const wsProtocol = locationProtocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${locationHost}/ws/notifications`;
}

export function applyMarkNotificationRead(notifications = [], targetId) {
    const next = notifications.map((n) =>
        n.id === targetId ? { ...n, read: true } : n,
    );
    const unreadCount = next.filter((n) => !n.read).length;
    return { notifications: next, unreadCount };
}

export function applyMarkAllNotificationsRead(notifications = []) {
    const next = notifications.map((n) => ({ ...n, read: true }));
    return { notifications: next, unreadCount: 0 };
}

export function getRealtimeNotificationActions(notification, currentUser) {
    if (!notification || !currentUser) {
        return { shouldDeliver: false, events: [] };
    }
    const isStaff =
        currentUser.role === "MANAGER" || currentUser.role === "ADMIN";
    const isForCurrentUser =
        notification.userId != null &&
        Number(notification.userId) === Number(currentUser.id);
    const isBroadcastStaff = notification.userId == null && isStaff;

    const shouldDeliver = isForCurrentUser || isBroadcastStaff;
    if (!shouldDeliver) {
        return { shouldDeliver: false, events: [] };
    }

    const events = [];
    const refId =
        notification.referenceId != null
            ? Number(notification.referenceId)
            : null;
    if (
        refId &&
        (notification.type === "ORDER" || notification.type === "RETURN") &&
        (notification.referenceType === "orders" ||
            notification.referenceType === "return_requests")
    ) {
        events.push({ name: "order-updated", detail: { orderId: refId } });
    } else if (notification.referenceType === "products") {
        events.push({
            name: "product-updated",
            detail: { productId: refId },
        });
    }

    return { shouldDeliver: true, events };
}
