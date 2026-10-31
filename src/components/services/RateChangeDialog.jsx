import { useEffect, useRef } from "react";
import Button from "../ui/Button";
import { CheckIcon, XIcon } from "../ui/Icons";
import { RATE_UNIT_LABEL, formatBaht } from "../../lib/format";

// US4-3: shown before saving a new rate, so the provider knows confirmed
// bookings keep the price they were booked at.
export default function RateChangeDialog({ serviceTitle, oldRate, newRate, oldUnit, newUnit, confirmedCount, isSaving, onConfirm, onClose }) {
    const keepEditingRef = useRef(null);

    useEffect(() => {
        keepEditingRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isSaving) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSaving, onClose]);

    const close = () => {
        if (!isSaving) onClose();
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="rate-change-title"
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                        <h2 id="rate-change-title" className="font-heading text-base font-semibold text-text-main">
                            Save the new rate?
                        </h2>
                        <p className="text-[13px] text-text-muted">{serviceTitle}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isSaving}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 px-6 py-5">
                    <div className="flex items-center justify-center gap-5 rounded-xl bg-secondary p-4">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-text-muted">Current</span>
                            <span className="text-lg font-semibold text-text-muted line-through">
                                {formatBaht(oldRate)} / {RATE_UNIT_LABEL[oldUnit]}
                            </span>
                        </div>
                        <span aria-hidden="true" className="text-text-muted">→</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-text-muted">New</span>
                            <span className="text-lg font-bold text-primary">
                                {formatBaht(newRate)} / {RATE_UNIT_LABEL[newUnit]}
                            </span>
                        </div>
                    </div>

                    <ul className="flex flex-col gap-3 text-sm leading-normal text-text-main">
                        <li className="flex gap-2.5">
                            <CheckIcon size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                            <span>
                                <strong>New bookings</strong> made after you save use the new rate.
                            </span>
                        </li>
                        <li className="flex gap-2.5">
                            <CheckIcon size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                            <span>
                                {confirmedCount > 0 ? (
                                    <>
                                        Your <strong>{confirmedCount} confirmed {confirmedCount === 1 ? "booking keeps" : "bookings keep"}</strong>{" "}
                                        the rate {confirmedCount === 1 ? "it was" : "they were"} booked at.
                                    </>
                                ) : (
                                    "Bookings that are already confirmed keep the rate they were booked at."
                                )}
                            </span>
                        </li>
                    </ul>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <Button ref={keepEditingRef} type="button" variant="secondary" className="h-10" onClick={close} disabled={isSaving}>
                        Keep editing
                    </Button>
                    <Button type="button" className="h-10 disabled:cursor-not-allowed disabled:opacity-70" onClick={onConfirm} disabled={isSaving}>
                        {isSaving ? "Saving…" : "Save new rate"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
