import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { AlertCircleIcon, CalendarIcon, CheckIcon, ClockIcon, MapPinIcon } from "../ui/Icons";
import { useAuth } from "../../hooks/useAuth";
import { hasRole } from "../../lib/roles";
import { formatBaht } from "../../lib/format";
import { ApiError, createBooking } from "../../services/sprint2Api";

// ---------- helpers ----------

function minutesOf(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function slotHours(slot) {
    return (minutesOf(slot.endTime) - minutesOf(slot.startTime)) / 60;
}

// กฎเดียวกับ priceFor ใน backend
function slotPrice(rate, rateUnit, slot) {
    if (rateUnit === "day") return Number(rate);
    return Math.round(Number(rate) * slotHours(slot) * 100) / 100;
}

// "YYYY-MM-DD" อ่านเป็น UTC วันที่จะได้ไม่เลื่อนตาม timezone ของคนดู
function formatDate(date, options) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}

const LONG_DATE = { weekday: "long", day: "numeric", month: "long", year: "numeric" };

// [{ date, slots }] เรียงตามวัน และเรียง slot ตามเวลา
function groupByDate(slots) {
    const map = new Map();
    for (const slot of slots) {
        if (!map.has(slot.date)) map.set(slot.date, []);
        map.get(slot.date).push(slot);
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, list]) => ({ date, slots: list.sort((a, b) => a.startTime.localeCompare(b.startTime)) }));
}

// ---------- component ----------

// ฟอร์มจองในหน้า service detail (US6-1): เลือก slot -> ยืนยัน -> สรุป
// onSlotsChanged: ให้หน้าแม่โหลด service ใหม่ เพื่ออัปเดตว่า slot ไหนถูกจองไปแล้ว
export default function BookingCard({ service, onSlotsChanged }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState("pick"); // "pick" | "confirm" | "done"
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);

    const rateUnit = service.rateUnit || "hour";
    const days = groupByDate(service.availableSlots || []);
    // ค่าเริ่มต้น = วันแรกที่ยังมี slot ว่าง
    const firstOpenDay = days.find((day) => day.slots.some((s) => s.available));
    const activeDate = selectedDate ?? firstOpenDay?.date ?? null;
    const activeDay = days.find((day) => day.date === activeDate);
    const selectedSlot = activeDay?.slots.find((s) => s.id === selectedSlotId && s.available) ?? null;

    const isOwnService = user?.id === service.providerId;
    const canBook = isAuthenticated && hasRole(user, "CUSTOMER") && !isOwnService;

    async function sendRequest() {
        setSubmitting(true);
        setError(null);
        try {
            const res = await createBooking({ serviceId: service.id, slotId: selectedSlot.id });
            setBooking(res.booking);
            setStep("done");
            onSlotsChanged?.();
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                // มีคนจองตัดหน้า: กลับไปเลือกใหม่ และโหลด slot ล่าสุด
                setError("Someone booked this time just before you. Please pick another slot.");
                setSelectedSlotId(null);
                setStep("pick");
                onSlotsChanged?.();
            } else if (err instanceof ApiError && err.status === 401) {
                navigate("/login");
            } else if (err instanceof ApiError) {
                setError(err.body?.error || "We couldn't send your request. Please try again.");
            } else {
                setError("Can't reach the server. Check your connection and try again.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    function startOver() {
        setBooking(null);
        setSelectedDate(null);
        setSelectedSlotId(null);
        setError(null);
        setStep("pick");
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-text-main">Price</span>
                <span className="font-bold text-lg text-text-main">
                    {formatBaht(service.rate)} <span className="font-normal text-sm text-text-muted">/ {rateUnit}</span>
                </span>
            </div>

            {/* ===== ขั้น 1: เลือก slot ===== */}
            {step === "pick" && days.length === 0 && (
                <p className="rounded-lg bg-secondary px-4 py-5 text-center text-sm text-text-muted">
                    The provider hasn't opened any dates yet. Check back soon.
                </p>
            )}

            {step === "pick" && days.length > 0 && (
                <>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-text-main">1. Choose a date</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {days.map((day) => {
                                const active = day.date === activeDate;
                                const full = !day.slots.some((s) => s.available);
                                return (
                                    <button
                                        key={day.date}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => {
                                            setSelectedDate(day.date);
                                            setSelectedSlotId(null);
                                            setError(null);
                                        }}
                                        className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 min-w-[64px] ${
                                            active ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-text-main hover:border-gray-400"
                                        } ${full && !active ? "opacity-50" : ""}`}
                                    >
                                        <span className="text-xs">{formatDate(day.date, { weekday: "short" })}</span>
                                        <span className="text-lg font-bold leading-tight">{formatDate(day.date, { day: "numeric" })}</span>
                                        <span className="text-xs">{formatDate(day.date, { month: "short" })}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {activeDay && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold text-text-main">2. Choose a time</p>
                            <div className="grid grid-cols-2 gap-2">
                                {activeDay.slots.map((slot) => {
                                    const chosen = selectedSlot?.id === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            disabled={!slot.available}
                                            aria-pressed={chosen}
                                            onClick={() => {
                                                setSelectedSlotId(slot.id);
                                                setError(null);
                                            }}
                                            className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                                                chosen
                                                    ? "border-primary bg-primary text-white"
                                                    : slot.available
                                                      ? "border-gray-200 bg-white text-text-main hover:border-gray-400"
                                                      : "border-gray-100 bg-secondary text-gray-400 cursor-not-allowed"
                                            }`}
                                        >
                                            {slot.startTime}–{slot.endTime}
                                            {!slot.available && <span className="block text-xs font-normal">Booked</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="font-semibold text-text-main">Total</span>
                        <span className="font-bold text-xl text-text-main">
                            {selectedSlot ? formatBaht(slotPrice(service.rate, rateUnit, selectedSlot)) : "–"}
                        </span>
                    </div>
                </>
            )}

            {/* ===== ขั้น 2: ยืนยัน ===== */}
            {step === "confirm" && selectedSlot && (
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-text-main">Check your request</p>
                    <ul className="flex flex-col gap-3 rounded-xl bg-secondary p-4 text-sm text-text-main">
                        <li className="flex gap-3"><CalendarIcon size={16} className="mt-0.5 text-text-muted" />{formatDate(selectedSlot.date, LONG_DATE)}</li>
                        <li className="flex gap-3"><ClockIcon size={16} className="mt-0.5 text-text-muted" />{selectedSlot.startTime}–{selectedSlot.endTime} ({slotHours(selectedSlot)} hr)</li>
                        <li className="flex gap-3"><MapPinIcon size={16} className="mt-0.5 text-text-muted" />{service.location}</li>
                    </ul>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-main">Total</span>
                        <span className="font-bold text-xl text-text-main">{formatBaht(slotPrice(service.rate, rateUnit, selectedSlot))}</span>
                    </div>
                    <p className="text-xs text-text-muted">
                        Your request goes to {service.provider?.firstname || "the provider"}, who will accept or reject it.
                    </p>
                </div>
            )}

            {/* ===== ขั้น 3: สรุป ===== */}
            {step === "done" && booking && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <CheckIcon size={24} />
                    </span>
                    <p className="text-lg font-bold text-text-main">Request sent</p>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        Waiting for confirmation
                    </span>
                    <p className="text-sm text-text-main">
                        {formatDate(booking.appointmentDate, LONG_DATE)}
                        {booking.startTime && <><br />{booking.startTime}–{booking.endTime}</>}
                    </p>
                    {booking.totalPrice != null && (
                        <p className="font-bold text-xl text-text-main">{formatBaht(booking.totalPrice)}</p>
                    )}
                </div>
            )}

            {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircleIcon size={16} className="mt-0.5" />
                    {error}
                </p>
            )}

            {/* ===== ปุ่ม ===== */}
            {step === "pick" && !isAuthenticated && (
                <Button variant="primary" className="w-full h-12" onClick={() => navigate("/login")}>
                    Log in to book
                </Button>
            )}
            {step === "pick" && isAuthenticated && !canBook && (
                <p className="text-sm text-text-muted text-center">
                    {isOwnService ? "This is your service, so you can't book it." : "Only customer accounts can book services."}
                </p>
            )}
            {step === "pick" && canBook && (
                <Button
                    variant="primary"
                    className="w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedSlot}
                    onClick={() => setStep("confirm")}
                >
                    {selectedSlot ? "Continue" : "Pick a time to continue"}
                </Button>
            )}

            {step === "confirm" && (
                <div className="flex flex-col gap-2">
                    <Button variant="primary" className="w-full h-12 disabled:opacity-60" disabled={submitting} onClick={sendRequest}>
                        {submitting ? "Sending request..." : "Send booking request"}
                    </Button>
                    <Button variant="secondary" className="w-full" disabled={submitting} onClick={() => setStep("pick")}>
                        Back
                    </Button>
                </div>
            )}

            {step === "done" && (
                <Button variant="secondary" className="w-full" onClick={startOver}>
                    Book another time
                </Button>
            )}
        </div>
    );
}