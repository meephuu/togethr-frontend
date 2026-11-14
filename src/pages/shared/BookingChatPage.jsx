import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { AlertCircleIcon, CalendarIcon, ChevronLeftIcon, ClockIcon, SendIcon } from "../../components/ui/Icons";
import { CARD_CLASS } from "../../lib/styles";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, connectChat, emitWithAck, getBookingMessages, sendBookingPhoto } from "../../services/chatApi";
import { assetUrl } from "../../lib/assets";
import ChatPhotoPreview from "../../components/chat/ChatPhotoPreview";

// Booking chat (US7-1): the customer and provider of a confirmed booking talk
// about the trip. History comes from REST; new messages arrive over Socket.IO.

const MAX_LENGTH = 2000;

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso) {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatAppointment(booking) {
    if (!booking.appointmentDate) return null;
    return new Date(`${booking.appointmentDate}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    });
}

// Adds a message unless it's already there (the sender gets both the ack and the broadcast)
function addMessage(list, message) {
    return list.some((m) => m.id === message.id) ? list : [...list, message];
}

function loadErrorText(err) {
    if (err instanceof ApiError && err.status === 403) {
        return "This chat opens once the provider confirms the booking, and only the customer and provider can see it.";
    }
    if (err instanceof ApiError && err.status === 404) return "We couldn't find this booking.";
    if (err instanceof ApiError && err.status === 401) return "Please log in again to see this chat.";
    return "We couldn't load this chat. Check your connection and try again.";
}

// ---------- pieces ----------

function ConnectionDot({ state }) {
    const map = {
        live: { label: "Live", className: "bg-emerald-500" },
        connecting: { label: "Connecting…", className: "bg-amber-400" },
        offline: { label: "Offline — reconnecting", className: "bg-red-500" },
    };
    const { label, className } = map[state];
    return (
        <span className="flex items-center gap-1.5 text-xs text-text-muted" role="status">
            <span className={`h-2 w-2 rounded-full ${className}`} aria-hidden="true" />
            {label}
        </span>
    );
}

function MessageList({ messages, myId, endRef }) {
    const [previewMessage, setPreviewMessage] = useState(null);
    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 py-16 text-center">
                <p className="font-semibold text-text-main">No messages yet</p>
                <p className="text-sm text-text-muted">Say hi and agree on the meeting point and plan.</p>
            </div>
        );
    }

    return (
        <>
        <ol className="flex flex-col gap-2 px-4 py-5 sm:px-6" aria-label="Messages">
            {messages.map((m, i) => {
                const mine = m.senderId === myId;
                const prev = messages[i - 1];
                const day = dayLabel(m.timestamp);
                const showDay = !prev || dayLabel(prev.timestamp) !== day;
                const grouped = !showDay && prev && prev.senderId === m.senderId;
                return (
                    <li key={m.id} className="flex flex-col">
                        {showDay && (
                            <span className="my-3 self-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-text-muted">
                                {day}
                            </span>
                        )}
                        <div className={`flex max-w-[80%] flex-col ${mine ? "self-end items-end" : "self-start items-start"} ${grouped ? "" : "mt-2"}`}>
                            {!mine && !grouped && (
                                <span className="mb-1 text-xs font-medium text-text-muted">{m.senderName}</span>
                            )}
                            <div
                                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-[15px] leading-relaxed ${
                                    mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-gray-100 text-text-main"
                                }`}
                            >
                                {m.imageUrl && (
                                    <button type="button" onClick={() => setPreviewMessage(m)} aria-label="Preview shared photo" className="block cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
                                        <img src={assetUrl(m.imageUrl)} alt="Shared trip photo" className="max-h-64 max-w-full rounded-lg object-contain" />
                                    </button>
                                )}
                                {m.content && <p className={m.imageUrl ? "mt-2" : ""}>{m.content}</p>}
                            </div>
                            <time dateTime={m.timestamp} className="mt-1 text-[11px] text-text-muted">
                                {formatTime(m.timestamp)}
                            </time>
                        </div>
                    </li>
                );
            })}
            <li ref={endRef} aria-hidden="true" />
        </ol>
        {previewMessage && <ChatPhotoPreview message={previewMessage} onClose={() => setPreviewMessage(null)} />}
        </>
    );
}

function Composer({ disabled, onSend }) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    function choosePhoto(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("Choose a JPG or PNG image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Photo must be 5 MB or smaller.");
            return;
        }
        setError(null);
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    }

    async function submit(e) {
        e?.preventDefault();
        const content = text.trim();
        if ((!content && !photo) || sending || disabled) return;
        setSending(true);
        setError(null);
        try {
            const ack = await onSend(content, photo);
            if (ack.ok) { setText(""); setPhoto(null); setPreview(null); }
            else setError(ack.error || "Couldn't send. Try again.");
        } catch (err) {
            setError(err.body?.error || "Couldn't send the photo. Try again.");
        } finally {
            setSending(false);
        }
    }

    return (
        <form onSubmit={submit} className="border-t border-gray-100 p-3 sm:p-4">
            {photo && preview && (
                <div className="mb-3 flex items-center gap-3">
                    <img src={preview} alt="Photo ready to send" className="h-20 w-20 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm text-text-muted">{photo.name}</span>
                    <button type="button" disabled={sending} onClick={() => { setPhoto(null); setPreview(null); }} className="text-sm font-medium text-red-700 disabled:opacity-50 hover:opacity-50 hover:cursor-pointer hover:underline">Remove photo</button>
                </div>
            )}
            {error && (
                <p role="alert" className="mb-2 flex items-center gap-2 text-sm text-red-700">
                    <AlertCircleIcon size={16} /> {error}
                </p>
            )}
            <div className="flex items-end gap-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={choosePhoto} className="hidden" aria-label="Choose chat photo" disabled={disabled || sending} />
                <Button type="button" variant="secondary" className="h-11 px-3" disabled={disabled || sending} onClick={() => fileRef.current?.click()} aria-label="Attach photo">Photo</Button>
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <textarea
                    id="chat-input"
                    rows={1}
                    value={text}
                    maxLength={MAX_LENGTH}
                    disabled={disabled || sending}
                    placeholder={disabled ? "Waiting for connection…" : "Write a message"}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
                    }}
                    className="max-h-40 min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[15px] text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
                />
                <Button
                    type="submit"
                    className="h-11 px-4 disabled:opacity-60"
                    disabled={disabled || sending || (!text.trim() && !photo)}
                    aria-label="Send message"
                    leftIcon={<SendIcon size={18} />}
                >
                    <span className="hidden sm:inline">{sending ? "Sending…" : "Send"}</span>
                </Button>
            </div>
            <p className="mt-1.5 text-[11px] text-text-muted">JPG or PNG up to 5 MB · Enter to send · Shift + Enter for a new line</p>
        </form>
    );
}

// ---------- page ----------

export default function BookingChatPage() {
    const { id: bookingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    // `for` is the booking the result belongs to; anything else means still loading
    const [result, setResult] = useState({ for: null });
    const [messages, setMessages] = useState([]);
    const [connection, setConnection] = useState("connecting");
    const socketRef = useRef(null);
    const endRef = useRef(null);

    // History
    useEffect(() => {
        let active = true;
        getBookingMessages(bookingId)
            .then((data) => {
                if (!active) return;
                setMessages(data.messages);
                setResult({ for: bookingId, status: "ready", data });
            })
            .catch((err) => active && setResult({ for: bookingId, status: "error", error: loadErrorText(err) }));
        return () => {
            active = false;
        };
    }, [bookingId]);
    const state = result.for === bookingId ? result : { status: "loading" };

    // Live messages, once the history says this user may be here
    const ready = state.status === "ready";
    useEffect(() => {
        if (!ready) return undefined;
        const socket = connectChat();
        socketRef.current = socket;

        const join = async () => {
            const ack = await emitWithAck(socket, "chat:join", { bookingId });
            setConnection(ack.ok ? "live" : "offline");
        };
        socket.on("connect", join);
        socket.on("disconnect", () => setConnection("offline"));
        socket.on("connect_error", () => setConnection("offline"));
        socket.on("chat:message", (message) => {
            if (message.bookingId === bookingId) setMessages((list) => addMessage(list, message));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [ready, bookingId]);

    // Keep the newest message in view
    useLayoutEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [messages.length]);

    async function send(content, photo) {
        if (photo) {
            const { message } = await sendBookingPhoto(bookingId, photo, content);
            setMessages((list) => addMessage(list, message));
            return { ok: true, message };
        }
        const socket = socketRef.current;
        if (!socket) return { ok: false, error: "Not connected yet." };
        const ack = await emitWithAck(socket, "chat:message", { bookingId, content });
        if (ack.ok && ack.message) setMessages((list) => addMessage(list, ack.message));
        return ack;
    }

    if (state.status === "loading") {
        return (
            <PageShell centered>
                <p className="text-text-muted" role="status">Loading chat…</p>
            </PageShell>
        );
    }

    if (state.status === "error") {
        return (
            <PageShell centered>
                <section role="alert" className={`${CARD_CLASS} flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center`}>
                    <AlertCircleIcon size={28} className="text-red-600" />
                    <p className="font-semibold text-text-main">Chat unavailable</p>
                    <p className="text-sm text-text-muted">{state.error}</p>
                    <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
                </section>
            </PageShell>
        );
    }

    const { booking, role, otherParty } = state.data;
    const backTo = role === "provider" ? "/provider/booking-requests" : "/customer/bookings";
    const appointment = formatAppointment(booking);

    return (
        <PageShell>
            <Link to={backTo} className="flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text-main">
                <ChevronLeftIcon size={16} />
                {role === "provider" ? "Booking requests" : "My bookings"}
            </Link>

            <section className={`${CARD_CLASS} mx-auto flex h-[calc(100vh-220px)] min-h-[480px] w-full max-w-3xl flex-col overflow-hidden`}>
                <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
                    {otherParty && (
                        <Avatar
                            photoUrl={otherParty.profilePhotoUrl}
                            firstname={otherParty.firstname}
                            lastname={otherParty.lastname}
                            size="sm"
                        />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                        <h1 className="truncate font-semibold text-text-main">
                            {otherParty ? `${otherParty.firstname} ${otherParty.lastname}` : "Booking chat"}
                        </h1>
                        <p className="flex flex-wrap items-center gap-x-3 text-xs text-text-muted">
                            <span className="truncate">{booking.serviceTitle}</span>
                            {appointment && (
                                <span className="flex items-center gap-1"><CalendarIcon size={12} />{appointment}</span>
                            )}
                            {booking.startTime && (
                                <span className="flex items-center gap-1"><ClockIcon size={12} />{booking.startTime}–{booking.endTime}</span>
                            )}
                        </p>
                    </div>
                    {booking.canSend && <ConnectionDot state={connection} />}
                </header>

                <div className="thin-scrollbar flex flex-1 flex-col overflow-y-auto">
                    <MessageList key={bookingId} messages={messages} myId={user?.id} endRef={endRef} />
                </div>

                {booking.canSend ? (
                    <Composer key={bookingId} disabled={connection !== "live"} onSend={send} />
                ) : (
                    <p className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-center text-sm text-text-muted">
                        This booking is {booking.status.toLowerCase()}, so the chat is read-only.
                    </p>
                )}
            </section>
        </PageShell>
    );
}
