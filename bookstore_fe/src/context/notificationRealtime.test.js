import test from "node:test";
import assert from "node:assert/strict";
import {
    applyMarkAllNotificationsRead,
    applyMarkNotificationRead,
    buildNotificationWsUrl,
    getRealtimeNotificationActions,
} from "./notificationRealtime.js";

test("buildNotificationWsUrl derives wss/ws host from VITE_API_BASE_URL instead of frontend hostname:8081", () => {
    assert.equal(
        buildNotificationWsUrl(
            "https://hcmute-kltn-bookstore.onrender.com/api/v1",
            "https:",
            "bookstore-kltn-deploy.vercel.app",
        ),
        "wss://hcmute-kltn-bookstore.onrender.com/ws/notifications",
    );
    assert.equal(
        buildNotificationWsUrl(
            "https://hcmute-kltn-bookstore.onrender.com/",
            "https:",
            "bookstore-kltn-deploy.vercel.app",
        ),
        "wss://hcmute-kltn-bookstore.onrender.com/ws/notifications",
    );
    assert.equal(
        buildNotificationWsUrl(
            "http://localhost:8081",
            "http:",
            "localhost:5173",
        ),
        "ws://localhost:8081/ws/notifications",
    );
});

test("applyMarkNotificationRead optimistically marks target read without double-decrementing", () => {
    const initial = [
        { id: 1, read: false },
        { id: 2, read: true },
        { id: 3, read: false },
    ];
    const step1 = applyMarkNotificationRead(initial, 1);
    assert.equal(step1.notifications[0].read, true);
    assert.equal(step1.unreadCount, 1);

    const step2 = applyMarkNotificationRead(step1.notifications, 2);
    assert.equal(step2.unreadCount, 1);

    const allRead = applyMarkAllNotificationsRead(initial);
    assert.equal(allRead.unreadCount, 0);
    assert.ok(allRead.notifications.every((n) => n.read));
});

test("getRealtimeNotificationActions emits order-updated for users/staff and product-updated for product changes", () => {
    const orderNotif = {
        id: 10,
        userId: 5,
        type: "ORDER",
        referenceType: "orders",
        referenceId: 180012,
        read: false,
    };
    const userActions = getRealtimeNotificationActions(orderNotif, {
        id: 5,
        role: "USER",
    });
    assert.equal(userActions.shouldDeliver, true);
    assert.deepEqual(userActions.events, [
        { name: "order-updated", detail: { orderId: 180012 } },
    ]);

    const otherUserActions = getRealtimeNotificationActions(orderNotif, {
        id: 99,
        role: "USER",
    });
    assert.equal(otherUserActions.shouldDeliver, false);
    assert.deepEqual(otherUserActions.events, []);

    const productNotif = {
        id: 11,
        userId: 2,
        type: "SYSTEM",
        referenceType: "products",
        referenceId: 44,
        read: false,
    };
    const managerActions = getRealtimeNotificationActions(productNotif, {
        id: 2,
        role: "MANAGER",
    });
    assert.equal(managerActions.shouldDeliver, true);
    assert.deepEqual(managerActions.events, [
        { name: "product-updated", detail: { productId: 44 } },
    ]);
});
