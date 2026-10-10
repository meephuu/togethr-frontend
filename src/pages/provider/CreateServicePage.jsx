import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import ProviderTabs from "../../components/provider/ProviderTabs";
import Button from "../../components/ui/Button";
import { AlertCircleIcon } from "../../components/ui/Icons";
import CoverPhotoPicker from "../../components/services/CoverPhotoPicker";
import CategoryChips from "../../components/services/CategoryChips";
import ServicePreviewCard from "../../components/services/ServicePreviewCard";
import PublishChecklist from "../../components/services/PublishChecklist";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, createService, getCategories } from "../../services/sprint2Api";
import {
    LOCATION_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    checkCoverPhotoFile,
    getPublishChecklist,
    mapServerErrors,
    validateService,
} from "../../lib/serviceValidation";
import { CARD_CLASS, ERROR_TEXT_CLASS, HELPER_TEXT_CLASS, LABEL_CLASS, inputClass } from "../../lib/styles";

const emptyForm = {
    coverPhoto: null,
    title: "",
    categoryIds: [],
    description: "",
    location: "",
    rate: "",
    rateUnit: "hour",
    startTime: "",
    endTime: "",
};

const SECTION_CLASS = `${CARD_CLASS} flex flex-col gap-5 p-6 sm:p-8`;

function shortName(user) {
    const initial = user?.lastname ? ` ${user.lastname[0]}.` : "";
    return `${user?.firstname ?? ""}${initial}`.trim() || user?.username || "you";
}

function ErrorBanner({ detail }) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800"
        >
            <AlertCircleIcon size={20} className="mt-px" />
            <div className="flex flex-col gap-0.5 text-sm">
                <p className="font-semibold">Your service wasn't published</p>
                <p>{detail}</p>
            </div>
        </div>
    );
}

export default function CreateServicePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loadState, setLoadState] = useState("loading"); // loading | error | ready
    const [reloadKey, setReloadKey] = useState(0);
    const [categories, setCategories] = useState([]);

    const [values, setValues] = useState(emptyForm);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
    const [photoError, setPhotoError] = useState(null);
    const [attempted, setAttempted] = useState(false);
    const [serverErrors, setServerErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getCategories()
            .then((categoryList) => {
                if (cancelled) return;
                setCategories(categoryList);
                setLoadState("ready");
            })
            .catch(() => {
                if (!cancelled) setLoadState("error");
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!coverPreviewUrl) return undefined;
        return () => URL.revokeObjectURL(coverPreviewUrl);
    }, [coverPreviewUrl]);

    // Client errors stay live after the first attempt, so fixing a field clears
    // its highlight. Server errors last until that field is edited.
    const errors = { ...serverErrors, ...(attempted ? validateService(values) : {}) };
    const errorCount = Object.keys(errors).length;
    const coverError = photoError ?? errors.coverPhoto;
    const endTimeError = errors.endTime;

    const updateField = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setServerErrors((prev) => {
            // A time-order error belongs to both times.
            const cleared = name === "startTime" || name === "endTime" ? ["startTime", "endTime"] : [name];
            if (!cleared.some((field) => field in prev)) return prev;
            const next = { ...prev };
            cleared.forEach((field) => delete next[field]);
            return next;
        });
    };

    const handleChange = (e) => updateField(e.target.name, e.target.value);

    const toggleCategory = (id) => {
        updateField(
            "categoryIds",
            values.categoryIds.includes(id)
                ? values.categoryIds.filter((categoryId) => categoryId !== id)
                : [...values.categoryIds, id],
        );
    };

    const handlePhotoSelect = (file) => {
        const problem = checkCoverPhotoFile(file);
        if (problem) {
            // Keep the current photo, if any; just explain why this one was refused.
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
        updateField("coverPhoto", null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttempted(true);
        setServerErrors({});
        setSubmitError("");

        if (Object.keys(validateService(values)).length > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);
        try {
            const { service } = await createService({
                ...values,
                title: values.title.trim(),
                location: values.location.trim(),
                description: values.description.trim(),
            });
            navigate("/provider/dashboard", {
                state: { publishedService: { id: service.id, title: service.title } },
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                const mapped = mapServerErrors(error.body?.errors);
                if (Object.keys(mapped).length > 0) {
                    setServerErrors(mapped);
                } else {
                    setSubmitError(error.body?.error || "Check the form and try again.");
                }
            } else if (error instanceof ApiError) {
                setSubmitError("We couldn't publish your service. Please try again.");
            } else {
                setSubmitError("We couldn't reach the server. Check your connection and try again.");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadState === "loading") {
        return (
            <PageShell centered subnav={<ProviderTabs />}>
                <p className="text-text-muted" role="status">
                    Loading…
                </p>
            </PageShell>
        );
    }

    if (loadState === "error") {
        return (
            <PageShell centered subnav={<ProviderTabs />}>
                <div className={`${CARD_CLASS} flex max-w-md flex-col items-center gap-4 p-8 text-center`}>
                    <p className="font-semibold text-text-main">We couldn't load this page.</p>
                    <p className="text-sm text-text-muted">Check your connection and try again.</p>
                    <Button
                        onClick={() => {
                            setLoadState("loading");
                            setReloadKey((key) => key + 1);
                        }}
                    >
                        Try again
                    </Button>
                </div>
            </PageShell>
        );
    }

    const describe = (id, error) => (error ? `${id}-error` : undefined);

    return (
        <PageShell subnav={<ProviderTabs />}>
            <div className="flex flex-col gap-2">
                <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
                    <Link to="/provider/dashboard" className="hover:text-text-main hover:underline">
                        Dashboard
                    </Link>{" "}
                    / <span className="text-text-main">Create service</span>
                </nav>
                <h1 className="text-[28px] text-text-main">Create a service</h1>
                <p className="text-text-muted">Customers will find this listing in search as soon as you publish it.</p>
            </div>

            {errorCount > 0 ? (
                <ErrorBanner
                    detail={`Fix the ${errorCount} highlighted ${errorCount === 1 ? "field" : "fields"}, then publish again.`}
                />
            ) : (
                submitError && <ErrorBanner detail={submitError} />
            )}

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <form onSubmit={handleSubmit} noValidate className="min-w-0 flex-1 lg:max-w-[760px]">
                    <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-6">
                        <CoverPhotoPicker
                            file={values.coverPhoto}
                            previewUrl={coverPreviewUrl}
                            error={coverError}
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
                                    placeholder="e.g. Old Town street food walk"
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
                                    aria-invalid={Boolean(errors.description)}
                                    aria-describedby="service-description-help"
                                    className={`${inputClass(errors.description)} resize-y leading-normal`}
                                />
                                {errors.description && <p className={ERROR_TEXT_CLASS}>{errors.description}</p>}
                                <p id="service-description-help" className={HELPER_TEXT_CLASS}>
                                    What you'll do together, what's included, and anything customers should bring.
                                </p>
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
                                    placeholder="e.g. Bangkok – Yaowarat & Old Town"
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
                                <label htmlFor="service-rate" className={LABEL_CLASS}>
                                    Rate
                                </label>
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
                                            placeholder="0"
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
                                    <p id="service-rate-note" className={HELPER_TEXT_CLASS}>
                                        Must be more than 0.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className={SECTION_CLASS} aria-labelledby="hours-heading">
                            <div className="flex flex-col gap-1">
                                <h2 id="hours-heading" className="text-lg text-text-main">
                                    Service hours
                                </h2>
                                <p className="text-sm text-text-muted">
                                    Your usual time window. You'll open specific dates in Availability after
                                    publishing.
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
                                        aria-invalid={Boolean(endTimeError)}
                                        aria-describedby={describe("service-end", endTimeError)}
                                        className={inputClass(endTimeError)}
                                    />
                                    {endTimeError && (
                                        <p id="service-end-error" className={ERROR_TEXT_CLASS}>
                                            {endTimeError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => navigate("/provider/dashboard")}>
                                Cancel
                            </Button>
                            <Button type="submit" className="disabled:cursor-not-allowed disabled:opacity-70">
                                {isSubmitting ? "Publishing…" : "Publish service"}
                            </Button>
                        </div>
                    </fieldset>
                </form>

                <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-40 lg:w-[408px] lg:shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Preview in search results
                    </p>
                    <ServicePreviewCard
                        values={values}
                        coverPreviewUrl={coverPreviewUrl}
                        categories={categories}
                        providerName={shortName(user)}
                    />
                    <PublishChecklist items={getPublishChecklist(values)} showFailures={attempted} />
                </aside>
            </div>
        </PageShell>
    );
}
