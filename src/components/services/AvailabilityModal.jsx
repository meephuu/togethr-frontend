import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, CopyIcon, XIcon } from "../ui/Icons";
import { getAvailability, updateAvailability } from "../../services/sprint2Api";
import { hourSlotsFor } from "../../lib/availability";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BLUE = "#155DFC";

function toISODate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// 6 full weeks (42 cells) so the grid height never jumps between months.
function buildMonthGrid(monthStart) {
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - monthStart.getDay());
    return Array.from({ length: 42 }, (_, i) => {
        const date = new Date(gridStart);
        date.setDate(date.getDate() + i);
        return date;
    });
}

function cloneSetMap(obj) {
    const next = {};
    Object.keys(obj).forEach((date) => {
        next[date] = new Set(obj[date]);
    });
    return next;
}

function serializeSetMap(obj) {
    const out = {};
    Object.keys(obj).forEach((date) => {
        if (obj[date].size > 0) out[date] = Array.from(obj[date]).sort();
    });
    return out;
}

// Availability modal for a provider's service (US4-2: "set the days and
// times I am available"). Day-rate services toggle whole dates. Hour-rate
// services pick which hours are open per date, since a booking on those only
// takes part of the day — hours come from the service's own startTime/
// endTime, shown in the header for day-rate services where the window itself
// can't be edited per-date.
export default function AvailabilityModal({ service, onClose }) {
    const isHourly = service.rateUnit === "hour";
    const hourSlots = useMemo(
        () => (isHourly ? hourSlotsFor(service.startTime, service.endTime) : []),
        [isHourly, service.startTime, service.endTime],
    );

    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error
    const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date(new Date().setDate(1))));
    const [selectedDate, setSelectedDate] = useState(null);

    // Day-rate state
    const [bookedDates, setBookedDates] = useState(new Set());
    const [savedDates, setSavedDates] = useState(new Set());
    const [selectedDates, setSelectedDates] = useState(new Set());

    // Hour-rate state: date -> Set<"HH:00">
    const [bookedSlots, setBookedSlots] = useState({});
    const [savedSlots, setSavedSlots] = useState({});
    const [openSlots, setOpenSlots] = useState({});

    useEffect(() => {
        let cancelled = false;
        // Resets the modal if the provider jumps straight from one service's
        // Availability action to another's without closing in between.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus("loading");
        getAvailability(service.id)
            .then((result) => {
                if (cancelled) return;
                if (isHourly) {
                    setOpenSlots(cloneSetMap(result.openSlots));
                    setSavedSlots(cloneSetMap(result.openSlots));
                    setBookedSlots(cloneSetMap(result.bookedSlots));
                } else {
                    setSavedDates(new Set(result.openDates));
                    setSelectedDates(new Set(result.openDates));
                    setBookedDates(new Set(result.bookedDates));
                }
                setStatus("ready");
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });
        return () => {
            cancelled = true;
        };
    }, [service.id, isHourly]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const today = useMemo(() => startOfDay(new Date()), []);
    const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

    const isDirty = isHourly
        ? JSON.stringify(serializeSetMap(openSlots)) !== JSON.stringify(serializeSetMap(savedSlots))
        : selectedDates.size !== savedDates.size || [...selectedDates].some((d) => !savedDates.has(d));

    const changeMonth = (delta) => {
        setViewMonth((prev) => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + delta);
            return next;
        });
        setSelectedDate(null);
    };

    // --- Day-rate interactions ---
    const toggleDate = (date, iso) => {
        if (date < today || date.getMonth() !== viewMonth.getMonth() || bookedDates.has(iso)) return;
        setSelectedDates((prev) => {
            const next = new Set(prev);
            if (next.has(iso)) next.delete(iso);
            else next.add(iso);
            return next;
        });
    };

    // --- Hour-rate interactions ---
    const datesForWeekday = (weekdayIndex) => {
        const result = [];
        const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
        while (d.getMonth() === viewMonth.getMonth()) {
            if (d.getDay() === weekdayIndex && d >= today) result.push(toISODate(d));
            d.setDate(d.getDate() + 1);
        }
        return result;
    };

    const toggleHour = (hour) => {
        if (!selectedDate || (bookedSlots[selectedDate] && bookedSlots[selectedDate].has(hour))) return;
        setOpenSlots((prev) => {
            const next = { ...prev, [selectedDate]: new Set(prev[selectedDate]) };
            if (next[selectedDate].has(hour)) next[selectedDate].delete(hour);
            else next[selectedDate].add(hour);
            return next;
        });
    };

    const setAllHours = (turnOn) => {
        if (!selectedDate) return;
        setOpenSlots((prev) => {
            const booked = bookedSlots[selectedDate] ?? new Set();
            const next = { ...prev, [selectedDate]: new Set(turnOn ? [] : (prev[selectedDate] ?? [])) };
            if (turnOn) {
                hourSlots.forEach((h) => {
                    if (!booked.has(h)) next[selectedDate].add(h);
                });
            } else {
                next[selectedDate] = new Set();
            }
            return next;
        });
    };

    const applyToWeekday = () => {
        if (!selectedDate) return;
        const d = new Date(`${selectedDate}T00:00:00`);
        const pattern = openSlots[selectedDate] ?? new Set();
        const targets = datesForWeekday(d.getDay());
        setOpenSlots((prev) => {
            const next = { ...prev };
            targets.forEach((iso) => {
                const booked = bookedSlots[iso] ?? new Set();
                next[iso] = new Set([...pattern].filter((h) => !booked.has(h)));
            });
            return next;
        });
    };

    const handleSave = async () => {
        setSaveStatus("saving");
        try {
            if (isHourly) {
                const result = await updateAvailability(service.id, serializeSetMap(openSlots));
                setOpenSlots(cloneSetMap(result.openSlots));
                setSavedSlots(cloneSetMap(result.openSlots));
                setBookedSlots(cloneSetMap(result.bookedSlots));
            } else {
                const result = await updateAvailability(service.id, Array.from(selectedDates));
                setSavedDates(new Set(result.openDates));
                setSelectedDates(new Set(result.openDates));
                setBookedDates(new Set(result.bookedDates));
            }
            onClose();
        } catch {
            setSaveStatus("error");
        }
    };

    const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Availability for ${service.title}`}
                className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl border-[1.5px] bg-white shadow-xl"
                style={{ borderColor: `${BLUE}40` }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                            style={{ backgroundColor: `${BLUE}1A`, color: BLUE }}
                        >
                            <CalendarIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 className="font-heading text-base font-semibold text-text-main">Availability</h2>
                            <p className="text-[13px] text-text-muted">{service.title}</p>
                            {!isHourly && service.startTime && service.endTime && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                                    <ClockIcon size={13} />
                                    {service.startTime} – {service.endTime} on open days
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-5">
                    {status === "loading" && (
                        <div className="flex h-72 items-center justify-center text-sm text-text-muted">
                            Loading availability…
                        </div>
                    )}
                    {status === "error" && (
                        <div role="alert" className="flex h-72 items-center justify-center text-center text-sm text-text-main">
                            We couldn't load this service's availability.
                        </div>
                    )}
                    {status === "ready" && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    aria-label="Previous month"
                                    onClick={() => changeMonth(-1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <ChevronLeftIcon size={18} />
                                </button>
                                <span className="font-heading text-sm font-semibold text-text-main">{monthLabel}</span>
                                <button
                                    type="button"
                                    aria-label="Next month"
                                    onClick={() => changeMonth(1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <ChevronRightIcon size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-text-muted">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {grid.map((date) => {
                                    const iso = toISODate(date);
                                    const inMonth = date.getMonth() === viewMonth.getMonth();
                                    const isPast = date < today;
                                    const isToday = date.getTime() === today.getTime();
                                    const disabled = isPast || !inMonth || (!isHourly && bookedDates.has(iso));

                                    let cellClass;
                                    let isSelected = false;
                                    let ariaState;

                                    if (isHourly) {
                                        const openCount = openSlots[iso]?.size ?? 0;
                                        const bookedCount = bookedSlots[iso]?.size ?? 0;
                                        const isFullyBooked = bookedCount > 0 && bookedCount === hourSlots.length;
                                        const isPartiallyBooked = bookedCount > 0 && !isFullyBooked;
                                        const hasOpen = openCount > 0;
                                        isSelected = iso === selectedDate;

                                        if (isFullyBooked) {
                                            cellClass = "border border-red-300 bg-red-100 text-red-800";
                                            ariaState = ", fully booked";
                                        } else if (isPartiallyBooked) {
                                            cellClass = "border border-amber-300 bg-amber-100 text-amber-800";
                                            ariaState = ", partially booked";
                                        } else if (hasOpen) {
                                            cellClass = "border-[1.5px] border-primary bg-white font-semibold text-primary";
                                            ariaState = ", has open hours";
                                        } else if (isPast || !inMonth) {
                                            cellClass = "border border-transparent bg-gray-500/5 text-gray-300";
                                        } else {
                                            cellClass = "border border-transparent bg-gray-500/10 text-text-muted hover:bg-gray-500/15";
                                            ariaState = ", no open hours";
                                        }
                                    } else {
                                        const isBooked = bookedDates.has(iso);
                                        const isDateSelected = selectedDates.has(iso);
                                        if (isBooked) {
                                            cellClass = "border border-amber-300 bg-amber-100 text-amber-800";
                                            ariaState = ", booked";
                                        } else if (isDateSelected) {
                                            cellClass = "border-[1.5px] border-primary bg-white font-semibold text-primary";
                                            ariaState = ", available";
                                        } else if (isPast || !inMonth) {
                                            cellClass = "border border-transparent bg-gray-500/5 text-gray-300";
                                        } else {
                                            cellClass = "border border-transparent bg-gray-500/10 text-text-muted hover:bg-gray-500/15";
                                            ariaState = ", unavailable";
                                        }
                                    }

                                    const handleClick = () => {
                                        if (disabled) return;
                                        if (isHourly) setSelectedDate((prev) => (prev === iso ? null : iso));
                                        else toggleDate(date, iso);
                                    };

                                    return (
                                        <button
                                            key={iso}
                                            type="button"
                                            disabled={disabled}
                                            aria-pressed={isHourly ? undefined : selectedDates.has(iso)}
                                            aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${ariaState ?? ""}`}
                                            onClick={handleClick}
                                            style={isSelected ? { outline: `2px solid ${BLUE}`, outlineOffset: "1px" } : undefined}
                                            className={`relative flex aspect-square items-center justify-center rounded-lg text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${cellClass} ${
                                                !inMonth ? "opacity-60" : ""
                                            } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            {date.getDate()}
                                            {isToday && (
                                                <span
                                                    className="absolute bottom-1 h-[3px] w-[3px] rounded-full"
                                                    style={{ backgroundColor: BLUE }}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-[18px] flex flex-wrap items-center gap-4 text-xs text-text-muted">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded border-[1.5px] border-primary bg-white" /> Available
                                </span>
                                {isHourly ? (
                                    <>
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" /> Booked (some)
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-3 w-3 rounded border border-red-300 bg-red-100" /> Booked (full)
                                        </span>
                                    </>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" /> Booked
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded bg-gray-500/10" /> Unavailable
                                </span>
                            </div>
                            <p className="mt-2.5 text-xs leading-relaxed text-text-muted">
                                {isHourly
                                    ? "Click a date to set its hours. Booked hours can't be changed here."
                                    : "Click a date to open or close it for booking. Booked dates can't be changed here."}
                            </p>

                            {isHourly && selectedDate && (
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <p className="text-[13px] font-semibold text-text-main">
                                            Time slots —{" "}
                                            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <div className="flex gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setAllHours(true)}
                                                className="text-xs font-semibold hover:underline"
                                                style={{ color: BLUE }}
                                            >
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAllHours(false)}
                                                className="text-xs font-semibold text-text-muted hover:underline"
                                            >
                                                None
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {hourSlots.map((hour) => {
                                            const isBooked = bookedSlots[selectedDate]?.has(hour);
                                            const isOpen = openSlots[selectedDate]?.has(hour);
                                            return (
                                                <button
                                                    key={hour}
                                                    type="button"
                                                    disabled={isBooked}
                                                    aria-pressed={!!isOpen}
                                                    onClick={() => toggleHour(hour)}
                                                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                                                        isBooked
                                                            ? "cursor-not-allowed border border-amber-300 bg-amber-100 text-amber-800"
                                                            : isOpen
                                                              ? "border-[1.5px] text-white"
                                                              : "border-[1.5px] border-gray-200 bg-white text-text-main hover:border-gray-300"
                                                    }`}
                                                    style={isOpen && !isBooked ? { borderColor: BLUE, backgroundColor: BLUE } : undefined}
                                                >
                                                    {hour}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applyToWeekday}
                                        className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                                        style={{ color: BLUE }}
                                    >
                                        <CopyIcon size={14} />
                                        Apply to every {WEEKDAYS[new Date(`${selectedDate}T00:00:00`).getDay()]} this month
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
                    {saveStatus === "error" ? (
                        <p role="alert" className="text-xs text-red-600">
                            Couldn't save. Try again.
                        </p>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-muted hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={handleSave}
                            disabled={status !== "ready" || !isDirty || saveStatus === "saving"}
                            className="px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ backgroundColor: BLUE }}
                        >
                            {saveStatus === "saving" ? "Saving…" : "Save changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
