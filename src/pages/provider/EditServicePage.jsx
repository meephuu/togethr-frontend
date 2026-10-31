import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import ProviderTabs from "../../components/provider/ProviderTabs";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { AlertCircleIcon } from "../../components/ui/Icons";
import CoverPhotoPicker from "../../components/services/CoverPhotoPicker";
import CategoryChips from "../../components/services/CategoryChips";
import ServicePreviewCard from "../../components/services/ServicePreviewCard";
import ServiceStatusPill from "../../components/services/ServiceStatusPill";
import RateChangeDialog from "../../components/services/RateChangeDialog";
import UnpublishDialog from "../../components/services/UnpublishDialog";
import { useAuth } from "../../hooks/useAuth";
import {
    ApiError,
    getCategories,
    getMyService,
    setServiceStatus,
    updateService,
} from "../../services/sprint2Api";
import {
    LOCATION_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    checkCoverPhotoFile,
    mapServerErrors,
    validateService,
} from "../../lib/serviceValidation";
import { RATE_UNIT_LABEL, formatBaht } from "../../lib/format";
import { CARD_CLASS, ERROR_TEXT_CLASS, HELPER_TEXT_CLASS, LABEL_CLASS, inputClass } from "../../lib/styles";

const SECTION_CLASS = `${CARD_CLASS} flex flex-col gap-5 p-6 sm:p-8`;

// Fields compared to tell whether the form has unsaved changes.
const EDITABLE_FIELDS = ["title", "description", "location", "rate", "rateUnit", "startTime", "endTime"];

function shortName(user) {
    const initial = user?.lastname ? ` ${user.lastname[0]}.` : "";
    return `${user?.firstname ?? ""}${initial}`.trim() || user?.username || "you";
}

// The API service → the form's values. rate stays a string, like the input.
function toFormValues(service) {
    return {
        coverPhoto: null, // a new File, only when the provider picks one
        coverPhotoUrl: service.coverPhotoUrl ?? null,
        title: service.title ?? "",
        categoryIds: service.categoryIds ?? [],
        description: service.description ?? "",
        location: service.location ?? "",
        rate: String(service.rate ?? ""),
        rateUnit: service.rateUnit ?? "hour",
        startTime: service.startTime ?? "",
        endTime: service.endTime ?? "",
    };
}

function changedFields(initial, values) {
    if (!initial) return [];
    const changed = EDITABLE_FIELDS.filter((field) => String(initial[field]) !== String(values[field]));
    const sameCategories =
        initial.categoryIds.length === values.categoryIds.length &&
        initial.categoryIds.every((id) => values.categoryIds.includes(id));
    if (!sameCategories) changed.push("categoryIds");
    if (values.coverPhoto || values.coverPhotoUrl !== initial.coverPhotoUrl) changed.push("coverPhoto");
    return changed;
}

function loadErrorMessage(error) {
    if (error instanceof ApiError && error.status === 404) return "This service doesn't exist.";
    if (error instanceof ApiError && error.status === 403) return "You can only edit your own services.";
    return "We couldn't load this page. Check your connection and try again.";
}

function ErrorBanner({ title, detail }) {
    return (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
            <AlertCircleIcon size={20} className="mt-px" />
            <div className="flex flex-col gap-0.5 text-sm">
                <p className="font-semibold">{title}</p>
                <p>{detail}</p>
            </div>
        </div>
    );
}

export default function EditServicePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [load, setLoad] = useState({ state: "loading", error: null }); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);
    const [categories, setCategories] = useState([]);
    const [service, setService] = useState(null); // status and counts from the server
    const [initialValues, setInitialValues] = useState(null);

    const [values, setValues] = useState(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState(null); // object URL of a newly picked photo
    const [photoError, setPhotoError] = useState(null);
    const [attempted, setAttempted] = useState(false);
    const [serverErrors, setServerErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showRateDialog, setShowRateDialog] = useState(false);

    // Unpublish: null | { mode: "confirm" | "blocked", pendingRequests, error }
    const [unpublish, setUnpublish] = useState(null);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [statusToast, setStatusToast] = useState("");

    useEffect(() => {
        let cancelled = false;

        Promise.all([getCategories(), getMyService(id)])
            .then(([categoryList, loaded]) => {
                if (cancelled) return;
                const formValues = toFormValues(loaded);
                setCategories(categoryList);
                setService(loaded);
                setInitialValues(formValues);
                setValues(formValues);
                setLoad({ state: "ready", error: null });
            })
            .catch((error) => {
                if (!cancelled) setLoad({ state: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [id, reloadKey]);

    useEffect(() => {
        if (!coverPreviewUrl) return undefined;
        return () => URL.revokeObjectURL(coverPreviewUrl);
    }, [coverPreviewUrl]);

    if (load.state === "loading") {
        return (
            <PageShell centered subnav={<ProviderTabs />}>
                <p className="text-text-muted" role="status">
                    Loading…
                </p>
            </PageShell>
        );
    }

    if (load.state === "error") {
        const notRetryable = load.error instanceof ApiError && [403, 404].includes(load.error.status);
        return (
            <PageShell centered subnav={<ProviderTabs />}>
                <div className={`${CARD_CLASS} flex max-w-md flex-col items-center gap-4 p-8 text-center`}>
                    <p className="font-semibold text-text-main">{loadErrorMessage(load.error)}</p>
                    {notRetryable ? (
                        <Button onClick={() => navigate("/provider/services")}>Back to My services</Button>
                    ) : (
                        <Button
                            onClick={() => {
                                setLoad({ state: "loading", error: null });
                                setReloadKey((key) => key + 1);
                            }}
                        >
                            Try again
                        </Button>
                    )}
                </div>
            </PageShell>
        );
    }

    // validateService only checks that some cover photo exists; the saved URL counts.
    const validate = (formValues) =>
        validateService({ ...formValues, coverPhoto: formValues.coverPhoto || formValues.coverPhotoUrl });

    const errors = { ...serverErrors, ...(attempted ? validate(values) : {}) };
    const errorCount = Object.keys(errors).length;
    const changed = changedFields(initialValues, values);
    const rateChanged = changed.includes("rate") || changed.includes("rateUnit");
    const isPublished = service.status === "PUBLISHED";
    const pendingCount = service.pendingRequestCount ?? 0;
    const confirmedCount = service.confirmedBookingCount ?? 0;

    const updateField = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setServerErrors((prev) => {
            const cleared = name === "startTime" || name === "endTime" ? ["startTime", "endTime"] : [name];
            if (!cleared.some((field) => field in prev)) return prev;
            const next = { ...prev };
            cleared.forEach((field) => delete next[field]);
            return next;
        });
    };

    const handleChange = (e) => updateField(e.target.name, e.target.value);

    const toggleCategory = (categoryId) => {
        updateField(
            "categoryIds",
            values.categoryIds.includes(categoryId)
                ? values.categoryIds.filter((idInList) => idInList !== categoryId)
                : [...values.categoryIds, categoryId],
        );
    };

    const handlePhotoSelect = (file) => {
        const problem = checkCoverPhotoFile(file);
        if (problem) {
            setPhotoError(problem);
            return;
        }
        setPhotoError(null);
        setCoverPreviewUrl(URL.createObjectURL(file));
        updateField("coverPhoto", file);
    };

    const handlePhotoRemove = () => {
        setPhotoError(null);
        setCoverPreviewUrl(null);
        setValues((prev) => ({ ...prev, coverPhoto: null, coverPhotoUrl: null }));
    };

    const save = async () => {
        setIsSaving(true);
        setSubmitError("");
        try {
            const { service: saved } = await updateService(id, {
                ...values,
                title: values.title.trim(),
                location: values.location.trim(),
                description: values.description.trim(),
            });
            navigate("/provider/services", {
                state: {
                    savedService: {
                        id: saved.id,
                        title: saved.title,
                        rateChanged,
                        oldRate: initialValues.rate,
                        oldRateUnit: initialValues.rateUnit,
                        newRate: saved.rate,
                        newRateUnit: saved.rateUnit,
                        confirmedCount,
                    },
                },
            });
        } catch (error) {
            setShowRateDialog(false);
            if (error instanceof ApiError && error.status === 400) {
                const mapped = mapServerErrors(error.body?.errors);
                if (Object.keys(mapped).length > 0) setServerErrors(mapped);
                else setSubmitError(error.body?.error || "Check the form and try again.");
            } else if (error instanceof ApiError) {
                setSubmitError(error.body?.error || "We couldn't save your changes. Please try again.");
            } else {
                setSubmitError("We couldn't reach the server. Check your connection and try again.");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAttempted(true);
        setServerErrors({});
        setSubmitError("");

        if (Object.keys(validate(values)).length > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (changed.length === 0) {
            navigate("/provider/services");
            return;
        }
        // A new rate is confirmed first (US4-3 acceptance criterion 1).
        if (rateChanged) setShowRateDialog(true);
        else save();
    };

    const openUnpublish = () => {
        setStatusToast("");
        // Checked again on the server; this just saves a round trip (US4-3 criterion 2).
        setUnpublish({ mode: pendingCount > 0 ? "blocked" : "confirm", pendingRequests: [], error: "" });
    };

    const confirmUnpublish = async () => {
        setIsChangingStatus(true);
        try {
            await setServiceStatus(id, "UNPUBLISHED");
            setService((prev) => ({ ...prev, status: "UNPUBLISHED" }));
            setUnpublish(null);
            setStatusToast("Service unpublished");
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                const pendingRequests = error.body?.pendingRequests ?? [];
                setService((prev) => ({ ...prev, pendingRequestCount: Math.max(pendingRequests.length, 1) }));
                setUnpublish({ mode: "blocked", pendingRequests, error: "" });
            } else {
                const message =
                    error instanceof ApiError
                        ? error.body?.error || "We couldn't unpublish this service. Please try again."
                        : "We couldn't reach the server. Check your connection and try again.";
                setUnpublish((prev) => ({ ...prev, error: message }));
            }
        } finally {
            setIsChangingStatus(false);
        }
    };

    const publishAgain = async () => {
        setIsChangingStatus(true);
        setStatusToast("");
        try {
            await setServiceStatus(id, "PUBLISHED");
            setService((prev) => ({ ...prev, status: "PUBLISHED" }));
            setStatusToast("Service published again");
        } catch {
            setSubmitError("We couldn't publish this service. Please try again.");
        } finally {
            setIsChangingStatus(false);
        }
    };

    const describe = (fieldId, error) => (error ? `${fieldId}-error` : undefined);
    const previewUrl = coverPreviewUrl ?? values.coverPhotoUrl;

    return (
        <PageShell subnav={<ProviderTabs />}>
            <div className="flex flex-col gap-2">
                <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
                    <Link to="/provider/services" className="hover:text-text-main hover:underline">
                        My services
                    </Link>{" "}
                    / <span className="text-text-main">Edit service</span>
                </nav>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[28px] text-text-main">Edit service</h1>
                    <ServiceStatusPill status={service.status} />
                </div>
                <p className="text-text-muted">Changes show in search as soon as you save.</p>
            </div>

            {!isPublished && (
                <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4"
                >
                    <div className="flex flex-col gap-0.5 text-sm">
                        <p className="font-semibold text-text-main">This service is hidden from search</p>
                        <p className="text-text-muted">
                            Customers who open its link see “This service is no longer available”.
                            {confirmedCount > 0 && " Confirmed bookings still go ahead."}
                        </p>
                    </div>
                    <Button onClick={publishAgain} disabled={isChangingStatus} className="h-11 disabled:opacity-70">
                        {isChangingStatus ? "Publishing…" : "Publish again"}
                    </Button>
                </div>
            )}

            {errorCount > 0 ? (
                <ErrorBanner
                    title="Your changes weren't saved"
                    detail={`Fix the ${errorCount} highlighted ${errorCount === 1 ? "field" : "fields"}, then save again.`}
                />
            ) : (
                submitError && <ErrorBanner title="Your changes weren't saved" detail={submitError} />
            )}

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <form onSubmit={handleSubmit} noValidate className="min-w-0 flex-1 lg:max-w-[760px]">
                    <fieldset disabled={isSaving} className="flex min-w-0 flex-col gap-6">
                        <CoverPhotoPicker
                            file={values.coverPhoto}
                            previewUrl={previewUrl}
                            error={photoError ?? errors.coverPhoto}
                            onSelect={handlePhotoSelect}
                            onRemove={handlePhotoRemove}
                        />

                        <section className={SECTION_CLASS} aria-labelledby="about-heading">
                            <h2 id="about-heading" className="text-lg text-text-main">
                                About the service
                            </h2>
                            <div>
                                <div className="mb-2 flex justify-between">
                                    <label htmlFor="service-title" className="text-sm font-medium text-text-main">
                                        Service title
                                    </label>
                                    <span className="text-xs text-text-muted">
                                        {values.title.length} / {TITLE_MAX_LENGTH}
                                    </span>
                                </div>
                                <input
                                    id="service-title"
                                    name="title"
                                    type="text"
                                    maxLength={TITLE_MAX_LENGTH}
                                    value={values.title}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.title)}
                                    aria-describedby={describe("service-title", errors.title)}
                                    className={inputClass(errors.title)}
                                />
                                {errors.title && (
                                    <p id="service-title-error" className={ERROR_TEXT_CLASS}>
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <CategoryChips
                                categories={categories}
                                selectedIds={values.categoryIds}
                                onToggle={toggleCategory}
                                error={errors.categoryIds}
                            />

                            <div>
                                <label htmlFor="service-description" className={LABEL_CLASS}>
                                    Description
                                </label>
                                <textarea
                                    id="service-description"
                                    name="description"
                                    rows={5}
                                    value={values.description}
                                    onChange={handleChange}
                                    className={`${inputClass(errors.description)} resize-y leading-normal`}
                                />
                                {errors.description && <p className={ERROR_TEXT_CLASS}>{errors.description}</p>}
                            </div>
                        </section>

                        <section className={SECTION_CLASS} aria-labelledby="location-heading">
                            <h2 id="location-heading" className="text-lg text-text-main">
                                Location and rate
                            </h2>
                            <div>
                                <label htmlFor="service-location" className={LABEL_CLASS}>
                                    Meeting area
                                </label>
                                <input
                                    id="service-location"
                                    name="location"
                                    type="text"
                                    maxLength={LOCATION_MAX_LENGTH}
                                    value={values.location}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.location)}
                                    aria-describedby={describe("service-location", errors.location)}
                                    className={inputClass(errors.location)}
                                />
                                {errors.location && (
                                    <p id="service-location-error" className={ERROR_TEXT_CLASS}>
                                        {errors.location}
                                    </p>
                                )}
                            </div>
                            <div>
                                <div className="mb-2 flex flex-wrap items-baseline gap-2">
                                    <label htmlFor="service-rate" className="text-sm font-medium text-text-main">
                                        Rate
                                    </label>
                                    {rateChanged && (
                                        <span className="text-xs text-text-muted">
                                            Was {formatBaht(initialValues.rate)} / {RATE_UNIT_LABEL[initialValues.rateUnit]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div
                                        className={`flex w-full items-center overflow-hidden rounded-lg border bg-white transition-all focus-within:ring-2 sm:w-60 ${
                                            errors.rate
                                                ? "border-red-600 focus-within:ring-red-600"
                                                : "border-gray-200 focus-within:ring-primary"
                                        }`}
                                    >
                                        <span className="border-r border-gray-200 bg-secondary px-3 py-2.5 text-sm text-text-muted">
                                            THB
                                        </span>
                                        <input
                                            id="service-rate"
                                            name="rate"
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            step="0.01"
                                            value={values.rate}
                                            onChange={handleChange}
                                            aria-invalid={Boolean(errors.rate)}
                                            aria-describedby="service-rate-note"
                                            className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 text-sm text-text-main focus:outline-none"
                                        />
                                    </div>
                                    <select
                                        name="rateUnit"
                                        aria-label="Rate unit"
                                        value={values.rateUnit}
                                        onChange={handleChange}
                                        className={`${inputClass(errors.rateUnit, "px-3")} sm:w-40`}
                                    >
                                        <option value="hour">per hour</option>
                                        <option value="day">per day</option>
                                    </select>
                                </div>
                                {errors.rate || errors.rateUnit ? (
                                    <p id="service-rate-note" className={ERROR_TEXT_CLASS}>
                                        {errors.rate || errors.rateUnit}
                                    </p>
                                ) : (
                                    <div
                                        id="service-rate-note"
                                        className="mt-3 flex flex-col gap-0.5 rounded-xl bg-blue-50 px-4 py-3 text-[13px] leading-normal text-blue-900"
                                    >
                                        <p className="font-semibold">A new rate applies only to bookings made after you save.</p>
                                        <p>
                                            {confirmedCount > 0
                                                ? `Your ${confirmedCount} confirmed ${confirmedCount === 1 ? "booking keeps" : "bookings keep"} the rate ${confirmedCount === 1 ? "it was" : "they were"} booked at.`
                                                : "Confirmed bookings keep the rate they were booked at."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className={SECTION_CLASS} aria-labelledby="hours-heading">
                            <div className="flex flex-col gap-1">
                                <h2 id="hours-heading" className="text-lg text-text-main">
                                    Service hours
                                </h2>
                                <p className="text-sm text-text-muted">
                                    Your usual time window. Specific dates are set in Availability.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="sm:w-[220px]">
                                    <label htmlFor="service-start" className={LABEL_CLASS}>
                                        Start time
                                    </label>
                                    <input
                                        id="service-start"
                                        name="startTime"
                                        type="time"
                                        value={values.startTime}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.startTime)}
                                        aria-describedby={describe("service-start", errors.startTime)}
                                        className={inputClass(errors.startTime)}
                                    />
                                    {errors.startTime && (
                                        <p id="service-start-error" className={ERROR_TEXT_CLASS}>
                                            {errors.startTime}
                                        </p>
                                    )}
                                </div>
                                <div className="sm:w-[220px]">
                                    <label htmlFor="service-end" className={LABEL_CLASS}>
                                        End time
                                    </label>
                                    <input
                                        id="service-end"
                                        name="endTime"
                                        type="time"
                                        value={values.endTime}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(errors.endTime)}
                                        aria-describedby={describe("service-end", errors.endTime)}
                                        className={inputClass(errors.endTime)}
                                    />
                                    {errors.endTime && (
                                        <p id="service-end-error" className={ERROR_TEXT_CLASS}>
                                            {errors.endTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[13px] text-text-muted" aria-live="polite">
                                {changed.length === 0
                                    ? "No changes yet"
                                    : `${changed.length} unsaved ${changed.length === 1 ? "change" : "changes"}`}
                            </span>
                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={() => navigate("/provider/services")}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="disabled:cursor-not-allowed disabled:opacity-70">
                                    {isSaving ? "Saving…" : "Save changes"}
                                </Button>
                            </div>
                        </div>
                    </fieldset>
                </form>

                <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-40 lg:w-[408px] lg:shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Preview in search results</p>
                    <ServicePreviewCard
                        values={values}
                        coverPreviewUrl={previewUrl}
                        categories={categories}
                        providerName={shortName(user)}
                    />

                    <section className={`${CARD_CLASS} flex flex-col gap-4 p-6`} aria-labelledby="visibility-heading">
                        <div className="flex items-center justify-between gap-3">
                            <h2 id="visibility-heading" className="text-base text-text-main">
                                Visibility
                            </h2>
                            <ServiceStatusPill status={service.status} />
                        </div>
                        <p className="text-sm leading-normal text-text-muted">
                            {isPublished
                                ? "Customers can find and book this service. Unpublish to hide it from search. Confirmed bookings still go ahead."
                                : "Hidden from search. Customers can't send new requests."}
                        </p>
                        <dl className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-text-muted">Pending requests</dt>
                                <dd className="font-semibold text-text-main">{pendingCount}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-text-muted">Confirmed bookings</dt>
                                <dd className="font-semibold text-text-main">{confirmedCount}</dd>
                            </div>
                        </dl>
                        {isPublished && (
                            <button
                                type="button"
                                onClick={openUnpublish}
                                className="inline-flex h-11 items-center justify-center rounded-lg border border-red-200 bg-white px-6 text-base font-medium text-red-700 transition-all duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                            >
                                Unpublish service
                            </button>
                        )}
                    </section>
                </aside>
            </div>

            {showRateDialog && (
                <RateChangeDialog
                    serviceTitle={values.title}
                    oldRate={initialValues.rate}
                    oldUnit={initialValues.rateUnit}
                    newRate={values.rate}
                    newUnit={values.rateUnit}
                    confirmedCount={confirmedCount}
                    isSaving={isSaving}
                    onConfirm={save}
                    onClose={() => setShowRateDialog(false)}
                />
            )}

            {unpublish && (
                <UnpublishDialog
                    mode={unpublish.mode}
                    serviceTitle={values.title}
                    confirmedCount={confirmedCount}
                    pendingCount={Math.max(pendingCount, unpublish.pendingRequests.length)}
                    pendingRequests={unpublish.pendingRequests}
                    isWorking={isChangingStatus}
                    error={unpublish.error}
                    onConfirm={confirmUnpublish}
                    onClose={() => setUnpublish(null)}
                />
            )}

            {statusToast && <Toast title={statusToast} onDismiss={() => setStatusToast("")} />}
        </PageShell>
    );
}
