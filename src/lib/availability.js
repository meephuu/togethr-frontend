// Shared by the mock backend and AvailabilityModal (US4-2). An hour-rate
// service's bookable hours are generated from its startTime/endTime rather
// than stored, so both sides always agree on what a valid slot is.
export function hourSlotsFor(startTime, endTime) {
    const startHour = Number(startTime.slice(0, 2));
    const endHour = Number(endTime.slice(0, 2));
    const hours = [];
    for (let h = startHour; h < endHour; h++) hours.push(`${String(h).padStart(2, "0")}:00`);
    return hours;
}
