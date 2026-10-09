export const RATE_UNIT_LABEL = { hour: "hour", day: "day" };

// "฿2,200" — whole baht stay whole, satang show up to 2 decimals.
export function formatBaht(amount) {
    const value = Number(amount);
    const safe = Number.isFinite(value) ? value : 0;
    return `฿${safe.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatFileSize(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
