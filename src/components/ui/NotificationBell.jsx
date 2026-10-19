import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { hasRole } from "../../lib/roles";
import {
    getMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../../services/sprint2Api";

function formatNotificationTime(value) {
    const elapsedSeconds = (new Date(value).getTime() - Date.now()) / 1000;
    if (!Number.isFinite(elapsedSeconds)) return "";

    const units = [
        ["year", 60 * 60 * 24 * 365],
        ["month", 60 * 60 * 24 * 30],
        ["week", 60 * 60 * 24 * 7],
        ["day", 60 * 60 * 24],
        ["hour", 60 * 60],
        ["minute", 60],
        ["second", 1],
    ];
    const [unit, seconds] = units.find(([, size]) => Math.abs(elapsedSeconds) >= size) ?? units.at(-1);
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(elapsedSeconds / seconds),
        unit
    );
}

export default function NotificationBell() {
    const { user } = useAuth();
    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadResult, setLoadResult] = useState({
        userId: null,
        reloadKey: 0,
        status: "loading",
        notifications: [],
    });
    const [actionError, setActionError] = useState("");
    const [markingId, setMarkingId] = useState(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!user?.id) return undefined;

        let cancelled = false;

        getMyNotifications()
            .then((items) => {
                if (!cancelled) {
                    setLoadResult({ userId: user.id, reloadKey, status: "ready", notifications: items });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setLoadResult({ userId: user.id, reloadKey, status: "error", notifications: [] });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user?.id, reloadKey]);

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

    if (!hasRole(user, "CUSTOMER") && !hasRole(user, "PROVIDER")) return null;

    const currentRequestMatches =
        loadResult.userId === user?.id && loadResult.reloadKey === reloadKey;
    const isLoading = !currentRequestMatches || loadResult.status === "loading";
    const loadError =
        currentRequestMatches && loadResult.status === "error"
            ? "We couldn't load your notifications."
            : "";
    const notifications =
        currentRequestMatches && loadResult.status === "ready" ? loadResult.notifications : [];
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;
    const visibleNotifications = isExpanded ? notifications : notifications.slice(0, 3);

    const toggleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
            setIsExpanded(false);
            return;
        }

        setIsOpen(true);
        setActionError("");
        setReloadKey((key) => key + 1);
    };

    const markAsRead = async (id) => {
        setMarkingId(id);
        setActionError("");
        try {
            await markNotificationRead(id);
            setLoadResult((current) => ({
                ...current,
                notifications: current.notifications.map((notification) =>
                    notification.id === id ? { ...notification, isRead: true } : notification
                ),
            }));
        } catch {
            setActionError("We couldn't mark that notification as read. Try again.");
        } finally {
            setMarkingId(null);
        }
    };

    const markAllAsRead = async () => {
        setIsMarkingAll(true);
        setActionError("");
        try {
            await markAllNotificationsRead();
            setLoadResult((current) => ({
                ...current,
                notifications: current.notifications.map((notification) => ({ ...notification, isRead: true })),
            }));
        } catch {
            setActionError("We couldn't mark your notifications as read. Try again.");
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={toggleOpen}
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
                            disabled={unreadCount === 0 || isMarkingAll}
                            className="rounded-sm text-sm font-normal text-white transition hover:text-gray-400 focus:outline-none focus:underline disabled:cursor-default disabled:text-gray-400"
                        >
                            {isMarkingAll ? "Marking…" : "Mark all as read"}
                        </button>
                    </header>

                    <div
                        className={isExpanded ? "max-h-[70vh] overflow-y-auto thin-scrollbar" : ""}
                    >
                        {actionError && (
                            <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {actionError}
                            </p>
                        )}
                        {isLoading ? (
                            <p role="status" className="p-6 text-center text-sm text-text-muted">
                                Loading notifications…
                            </p>
                        ) : loadError ? (
                            <div role="alert" className="p-6 text-center text-sm text-red-700">
                                <p>{loadError}</p>
                                <button
                                    type="button"
                                    onClick={() => setReloadKey((key) => key + 1)}
                                    className="mt-2 font-semibold text-primary hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <p className="p-6 text-center text-md text-text-muted">
                                No notifications
                            </p>
                        ) : (
                            visibleNotifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={notification.isRead || markingId === notification.id || isMarkingAll}
                                    className="flex w-full items-start gap-3 border-b border-gray-100 bg-white p-4 text-left transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-sm text-text-main ${
                                            notification.isRead ? "font-normal" : "font-semibold"
                                        }`}>
                                            {notification.message}
                                        </span>
                                        <span className="mt-1 block text-xs text-text-muted">
                                            {formatNotificationTime(notification.createdAt)}
                                        </span>
                                    </span>
                                    {!notification.isRead && (
                                        <span
                                            aria-label="Unread"
                                            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                                        />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {!isLoading && !loadError && notifications.length > 0 && (
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
