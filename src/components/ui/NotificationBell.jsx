import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { hasRole } from "../../lib/roles";

//Mock Notifications (to be implemented)
const INITIAL_NOTIFICATIONS = [
    { id: 1, message: "Your booking request was sent.", time: "5 min ago", read: false },
    { id: 2, message: "Your booking for the city tour was confirmed.", time: "1 hour ago", read: false },
    { id: 3, message: "Your booking request was declined.", time: "2 hours ago", read: true },
    { id: 4, message: "Your booking for the food walk is awaiting confirmation.", time: "Yesterday", read: true },
    { id: 5, message: "Your booking for the temple tour was cancelled.", time: "Yesterday", read: true },
    { id: 6, message: "Your booking for the photo walk was confirmed.", time: "2 days ago", read: true },
    { id: 7, message: "Your booking request was sent.", time: "3 days ago", read: true },
    { id: 8, message: "Your booking for the market tour was confirmed.", time: "4 days ago", read: true },
];

export default function NotificationBell() {
    const { user } = useAuth();
    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    useEffect(() => {
        if (!isOpen) return undefined;

        const closeOnOutsideClick = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
                setIsExpanded(false);
            }
        };

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setIsExpanded(false);
            }
        };

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen]);

    if (!hasRole(user, "CUSTOMER")) return null;

    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const visibleNotifications = isExpanded ? notifications : notifications.slice(0, 3);

    const markAsRead = (id) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((current) =>
            current.map((notification) => ({ ...notification, read: true }))
        );
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={isOpen}
                aria-controls="notification-dropdown"
                className="relative rounded-lg p-2 text-text-muted transition hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <section
                    id="notification-dropdown"
                    aria-label="Notifications"
                    className="absolute right-0 z-50 mt-2 flex max-h-[calc(100vh-6rem)] w-100 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                    <header className="flex items-center justify-between gap-3 p-4 bg-primary">
                        <h3 className="text-base font-semibold text-white">Notifications</h3>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="rounded-sm text-sm font-normal text-white transition hover:text-gray-400 focus:outline-none focus:underline disabled:cursor-default disabled:text-gray-400"
                        >
                            Mark all as read
                        </button>
                    </header>

                    <div
                        className={isExpanded ? "max-h-[70vh] overflow-y-auto thin-scrollbar" : ""}
                    >
                        {notifications.length === 0 ? (
                            <p className="p-6 text-center text-md text-text-muted">
                                No notifications
                            </p>
                        ) : (
                            visibleNotifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markAsRead(notification.id)}
                                    className="flex w-full items-start gap-3 border-b border-gray-100 bg-white p-4 text-left transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-sm text-text-main ${
                                            notification.read ? "font-normal" : "font-semibold"
                                        }`}>
                                            {notification.message}
                                        </span>
                                        <span className="mt-1 block text-xs text-text-muted">
                                            {notification.time}
                                        </span>
                                    </span>
                                    {!notification.read && (
                                        <span
                                            aria-label="Unread"
                                            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                                        />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <footer className="border-t border-gray-200 p-2.5 text-center">
                            <button
                                type="button"
                                onClick={() => setIsExpanded((expanded) => !expanded)}
                                aria-expanded={isExpanded}
                                className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {isExpanded ? "Show fewer notifications" : "View all notifications"}
                            </button>
                        </footer>
                    )}
                </section>
            )}
        </div>
    );
}
