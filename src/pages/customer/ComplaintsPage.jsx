import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CustomerTabs from "../../components/customer/CustomerTabs";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import { formatFileSize } from "../../lib/format";
import { CARD_CLASS, LABEL_CLASS, inputClass } from "../../lib/styles";
import { ComplaintsService } from "../../services/generated";
import { complaintAttachmentUrl, getMyComplaint, getMyComplaints } from "../../services/sprint2Api";

const statuses = {
    PENDING: "Pending review",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
};
const nextStatus = { PENDING: "IN_PROGRESS", IN_PROGRESS: "RESOLVED" };

function dateLabel(value) {
    return new Date(value).toLocaleDateString("en-GB", { dateStyle: "medium" });
}

function Status({ value }) {
    return <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium">{statuses[value]}</span>;
}

function ComplaintList({ complaints, base, bookingId }) {
    const [status, setStatus] = useState("");
    const visible = complaints.filter((item) =>
        (!status || item.status === status) && (!bookingId || item.bookingId === bookingId)
    );
    return (
        <>
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label htmlFor="complaint-status-filter" className={LABEL_CLASS}>Status</label>
                    <select id="complaint-status-filter" value={status} className={inputClass(false)}
                        onChange={(event) => setStatus(event.target.value)}>
                        <option value="">All statuses</option>
                        {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>
                {bookingId && <Link className="pb-2 text-sm underline" to={base}>Show all complaints</Link>}
            </div>
            {visible.length === 0 ? (
                <p className={`${CARD_CLASS} p-6 text-text-muted`}>
                    {status || bookingId ? "No complaints match these filters." : "No complaints yet."}
                </p>
            ) : (
                <ul className="space-y-3">
                    {visible.map((item) => (
                        <li key={item.id} className={CARD_CLASS}>
                            <Link to={`${base}/${encodeURIComponent(item.id)}`}
                                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl p-5 hover:bg-gray-50">
                                <div className="min-w-0">
                                    <p className="break-words font-semibold">{item.subject}</p>
                                    <p className="text-sm text-text-muted">{item.booking.service.title} · {dateLabel(item.createdAt)}</p>
                                    <p className="mt-1 break-all text-xs text-text-muted">Reference {item.id}</p>
                                </div>
                                <Status value={item.status} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

function ReviewForm({ complaint, onSave }) {
    const [status, setStatus] = useState(complaint.status);
    const [reply, setReply] = useState(complaint.adminReply || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function save(event) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        setError("");
        try {
            const { complaint: updated } = await ComplaintsService.updateAdminComplaint({
                id: complaint.id,
                requestBody: {
                    status, adminReply: reply, expectedStatus: complaint.status,
                    expectedUpdatedAt: complaint.updatedAt,
                },
            });
            onSave(updated);
        } catch (err) {
            setError(err.body?.error || "Could not save the complaint.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={save} className={`${CARD_CLASS} p-5`}>
            <fieldset disabled={saving} className="space-y-4">
                <div>
                    <label htmlFor="review-status" className={LABEL_CLASS}>Status</label>
                    <select id="review-status" value={status} className={inputClass(false)}
                        onChange={(event) => setStatus(event.target.value)}>
                        {[complaint.status, nextStatus[complaint.status]].map((value) =>
                            <option key={value} value={value}>{statuses[value]}</option>
                        )}
                    </select>
                </div>
                <div>
                    <label htmlFor="review-reply" className={LABEL_CLASS}>Reply to customer</label>
                    <textarea id="review-reply" rows={4} maxLength={2000} value={reply} className={inputClass(false)}
                        onChange={(event) => setReply(event.target.value)} />
                </div>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <Button type="submit">{saving ? "Saving…" : "Save update"}</Button>
            </fieldset>
        </form>
    );
}

function ComplaintDetails({ complaint, admin, onSave }) {
    return (
        <>
            <article className={`${CARD_CLASS} space-y-4 p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="break-words text-lg">{complaint.subject}</h2>
                        <p className="text-sm text-text-muted">{complaint.booking.service.title} · {dateLabel(complaint.createdAt)}</p>
                        <p className="mt-1 break-all text-xs text-text-muted">Reference {complaint.id}</p>
                    </div>
                    <Status value={complaint.status} />
                </div>
                <p className="text-sm text-text-muted">
                    {complaint.category.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}
                </p>
                <p className="whitespace-pre-wrap break-words">{complaint.description}</p>
                {complaint.attachments.length > 0 && (
                    <section aria-label="Attachments" className="border-t border-gray-100 pt-4">
                        <p className="mb-2 font-medium">Attachments</p>
                        <ul className="space-y-2">
                            {complaint.attachments.map((file) => (
                                <li key={file.id} className="text-sm">
                                    <a href={complaintAttachmentUrl(complaint.id, file.id, admin)}
                                        className="break-all text-primary underline">{file.originalName}</a>
                                    <span className="ml-2 text-text-muted">{formatFileSize(file.sizeBytes)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
            <section className={`${CARD_CLASS} p-5`}>
                <h2 className="mb-2 text-base">Support reply</h2>
                <p className="whitespace-pre-wrap break-words text-sm text-text-muted">
                    {complaint.adminReply || "No reply yet."}
                </p>
            </section>
            {!admin && <Link to="/customer/bookings" className="self-start text-sm underline">My bookings</Link>}
            {admin && nextStatus[complaint.status] && (
                <ReviewForm key={complaint.updatedAt} complaint={complaint} onSave={onSave} />
            )}
        </>
    );
}

function ComplaintContent({ admin, base, id, bookingId }) {
    const [result, setResult] = useState({ loading: true });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let ignore = false;
        async function load() {
            try {
                const data = id
                    ? admin ? (await ComplaintsService.getAdminComplaint({ id })).complaint : await getMyComplaint(id)
                    : admin ? (await ComplaintsService.listAdminComplaints()).complaints : await getMyComplaints();
                if (!ignore) setResult(data ? { data } : { error: "Complaint not found.", status: 404 });
            } catch (err) {
                if (!ignore) setResult({ error: err.body?.error || "Could not load complaints.", status: err.status });
            }
        }
        load();
        return () => { ignore = true; };
    }, [admin, id, retry]);

    if (result.loading) return <p role="status">Loading complaints…</p>;
    if (result.error) {
        return (
            <div className={`${CARD_CLASS} space-y-3 p-5`}>
                <p role="alert">{result.error}</p>
                {result.status === 401 ? <Link className="underline" to="/login">Sign in</Link>
                    : ![403, 404].includes(result.status) && (
                        <Button onClick={() => {
                            setResult({ loading: true });
                            setRetry((value) => value + 1);
                        }}>Try again</Button>
                    )}
            </div>
        );
    }
    return id
        ? <ComplaintDetails complaint={result.data} admin={admin} onSave={(data) => setResult({ data })} />
        : <ComplaintList complaints={result.data} base={base} bookingId={bookingId} />;
}

export default function ComplaintsPage({ admin = false }) {
    const { id } = useParams();
    const [params] = useSearchParams();
    const base = admin ? "/admin/complaints" : "/customer/complaints";
    const label = admin ? "Admin complaints" : "My complaints";
    return (
        <PageShell subnav={admin ? undefined : <CustomerTabs />}>
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                {id && <Link to={base} className="self-start text-sm underline">← {label}</Link>}
                <h1 className="text-2xl text-text-main sm:text-[28px]">{id ? "Complaint details" : label}</h1>
                <ComplaintContent key={`${base}/${id || ""}`} admin={admin} base={base} id={id} bookingId={params.get("bookingId")} />
            </div>
        </PageShell>
    );
}
