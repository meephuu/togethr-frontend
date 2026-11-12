import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import CustomerTabs from "../../components/customer/CustomerTabs";
import ServiceThumbnail from "../../components/services/ServiceThumbnail";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import { formatBookingDate, formatFileSize } from "../../lib/format";
import { CARD_CLASS, ERROR_TEXT_CLASS, LABEL_CLASS, inputClass } from "../../lib/styles";
import { ApiError, getMyBookings, submitComplaint } from "../../services/sprint2Api";

const CATEGORIES = [
    ["PAYMENT", "Payment"],
    ["CANCELLATION_OR_REFUND", "Cancellation or refund"],
    ["PROVIDER_NO_SHOW", "Provider did not show up"],
    ["SERVICE_NOT_AS_DESCRIBED", "Service not as described"],
    ["OTHER", "Other"],
];
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILES = /\.(jpe?g|png|pdf)$/i;
const BOOKINGS_URL = "/customer/bookings";

function ComplaintForm({ booking, backState }) {
    const [category, setCategory] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [fileError, setFileError] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const submitting = useRef(false);

    function addFiles(event) {
        const picked = Array.from(event.target.files);
        event.target.value = "";
        if (picked.length === 0) return;
        if (picked.length + attachments.length > MAX_FILES) {
            setFileError("You can attach up to 5 files.");
            return;
        }
        const invalid = picked.find((file) =>
            !ACCEPTED_FILES.test(file.name) || file.size === 0 || file.size > MAX_BYTES
        );
        if (invalid) {
            setFileError(`${invalid.name}: choose a nonempty JPG, PNG or PDF up to 10 MB.`);
            return;
        }
        setAttachments([...attachments, ...picked]);
        setFileError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting.current) return;
        if (!category || !subject.trim() || !description.trim()) {
            setError("Choose a category and enter a subject and description.");
            return;
        }
        submitting.current = true;
        setSending(true);
        setError("");
        try {
            setComplaint(await submitComplaint({
                bookingId: booking.id,
                category,
                subject: subject.trim(),
                description: description.trim(),
                attachments,
            }));
        } catch (err) {
            setError(err instanceof ApiError
                ? err.body?.error || err.message
                : "We couldn't submit your complaint. Check your connection and try again.");
        } finally {
            submitting.current = false;
            setSending(false);
        }
    }

    if (complaint) {
        return (
            <section className={`${CARD_CLASS} space-y-3 p-6`} aria-live="polite">
                <p className="text-lg font-semibold text-text-main">Complaint submitted</p>
                <p className="text-sm text-text-muted">Status: Pending review</p>
                <p className="break-all text-sm text-text-muted">Reference: {complaint.id}</p>
                <Link to={BOOKINGS_URL} state={backState} className="inline-block font-medium text-primary underline">
                    Back to My bookings
                </Link>
            </section>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`${CARD_CLASS} p-4 sm:p-6`}>
            <fieldset disabled={sending} className="min-w-0 space-y-5">
                <div>
                    <label htmlFor="complaint-category" className={LABEL_CLASS}>Issue category *</label>
                    <select id="complaint-category" required value={category}
                        onChange={(event) => setCategory(event.target.value)} className={inputClass(false)}>
                        <option value="">Select a category</option>
                        {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="complaint-subject" className={LABEL_CLASS}>Subject *</label>
                    <input id="complaint-subject" required maxLength={100} value={subject}
                        onChange={(event) => setSubject(event.target.value)} className={inputClass(false)}
                        placeholder="Summarize the issue" />
                </div>
                <div>
                    <label htmlFor="complaint-description" className={LABEL_CLASS}>Description *</label>
                    <textarea id="complaint-description" required maxLength={2000} rows={5} value={description}
                        onChange={(event) => setDescription(event.target.value)} className={inputClass(false)}
                        placeholder="Tell us what happened and how we can help" />
                </div>
                <div>
                    <label htmlFor="complaint-files" className={LABEL_CLASS}>Attachments (optional)</label>
                    <div className="rounded-lg border border-dashed border-gray-300 p-4">
                        <input id="complaint-files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                            aria-describedby="complaint-file-help" onChange={addFiles}
                            className="block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:font-medium file:text-primary" />
                        <p id="complaint-file-help" className="mt-2 text-xs text-text-muted">
                            JPG, PNG or PDF · Up to 5 files · 10 MB per file
                        </p>
                    </div>
                    {fileError && <p role="alert" className={ERROR_TEXT_CLASS}>{fileError}</p>}
                    {attachments.length > 0 && (
                        <ul className="mt-3 space-y-2">
                            {attachments.map((file, index) => (
                                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="min-w-0 break-all">{file.name} · {formatFileSize(file.size)}</span>
                                    <button type="button" className="shrink-0 text-primary underline"
                                        aria-label={`Remove ${file.name}`}
                                        onClick={() => {
                                            setAttachments(attachments.filter((_, position) => position !== index));
                                            setFileError("");
                                        }}>
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </fieldset>
            {error && <p role="alert" className={`mt-4 ${ERROR_TEXT_CLASS}`}>{error}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                {!sending && (
                    <Link to={BOOKINGS_URL} state={backState}
                        className="rounded-lg border border-gray-200 px-6 py-2.5 font-medium text-primary hover:bg-gray-50">
                        Cancel
                    </Link>
                )}
                <Button type="submit" disabled={sending} className="disabled:opacity-60">
                    {sending ? "Submitting…" : "Submit complaint"}
                </Button>
            </div>
        </form>
    );
}

function BookingComplaint({ bookingId, backState }) {
    const [result, setResult] = useState({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let ignore = false;
        getMyBookings().then(({ upcoming, past }) => {
            if (ignore) return;
            const booking = [...upcoming, ...past].find((item) => item.id === bookingId);
            setResult(booking ? { status: "ready", booking } : { status: "missing" });
        }).catch(() => {
            if (!ignore) setResult({ status: "error" });
        });
        return () => { ignore = true; };
    }, [bookingId, attempt]);

    if (result.status === "loading") return <p role="status">Loading booking…</p>;
    if (result.status === "missing") return <p role="alert">This booking isn't in your bookings.</p>;
    if (result.status === "error") {
        return (
            <div className="space-y-3">
                <p role="alert">We couldn't load your booking.</p>
                <Button onClick={() => {
                    setResult({ status: "loading" });
                    setAttempt((previous) => previous + 1);
                }}>Try again</Button>
            </div>
        );
    }

    const { booking } = result;
    return (
        <>
            <section aria-label="Booking summary" className={`${CARD_CLASS} flex items-center gap-4 p-4`}>
                <ServiceThumbnail url={booking.service.coverPhotoUrl} />
                <div className="min-w-0">
                    <p className="font-semibold text-text-main">{booking.service.title}</p>
                    <p className="text-sm text-text-muted">
                        {formatBookingDate(booking.appointmentDate)}
                        {booking.startTime && ` · ${booking.startTime}–${booking.endTime}`}
                    </p>
                </div>
            </section>
            <ComplaintForm booking={booking} backState={backState} />
        </>
    );
}

export default function ComplaintPage() {
    const { bookingId } = useParams();
    const { state } = useLocation();
    const backState = { tab: state?.tab };
    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                <Link to={BOOKINGS_URL} state={backState} className="self-start text-sm font-medium text-primary hover:underline">
                    ← My bookings
                </Link>
                <h1 className="text-2xl text-text-main sm:text-[28px]">Report a booking issue</h1>
                <BookingComplaint key={bookingId} bookingId={bookingId} backState={backState} />
            </div>
        </PageShell>
    );
}
