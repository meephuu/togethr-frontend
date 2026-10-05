import { ImageIcon, MapPinIcon } from "../ui/Icons";
import { RATE_UNIT_LABEL, formatBaht } from "../../lib/format";

// How the service will look in search results, built from live form state.
export default function ServicePreviewCard({ values, coverPreviewUrl, categories, providerName }) {
    const selectedCategories = categories.filter((category) => values.categoryIds.includes(category.id));
    const title = values.title.trim();
    const location = values.location.trim();
    const rate = Number(values.rate) > 0 ? values.rate : 0;

    return (
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {coverPreviewUrl ? (
                <img src={coverPreviewUrl} alt="" className="h-[220px] w-full object-cover" />
            ) : (
                <div className="flex h-[220px] items-center justify-center bg-gray-200 text-text-muted">
                    <ImageIcon size={32} />
                </div>
            )}
            <div className="flex flex-col gap-2.5 p-5">
                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedCategories.map((category) => (
                            <span key={category.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-text-main">
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}
                <p className={`break-words text-lg font-semibold ${title ? "text-text-main" : "text-gray-400"}`}>
                    {title || "Your service title"}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <MapPinIcon size={16} />
                    <span className={location ? "" : "text-gray-400"}>{location || "Meeting area"}</span>
                </p>
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
                    <span className="text-sm text-text-muted">with {providerName} · New provider</span>
                    <span className="whitespace-nowrap text-base font-bold text-primary">
                        {formatBaht(rate)}{" "}
                        <span className="text-[13px] font-normal text-text-muted">/ {RATE_UNIT_LABEL[values.rateUnit]}</span>
                    </span>
                </div>
            </div>
        </article>
    );
}
