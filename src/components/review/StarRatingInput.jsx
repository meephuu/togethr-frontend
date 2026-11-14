import { useState } from "react";
import { StarFilledIcon } from "../ui/Icons";

// Words shown under the stars, so a rating means the same thing to everyone
export const RATING_LABELS = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent",
};

const STAR_ON = "text-[#E7711B]"; // same orange as the ratings on cards and profiles
const STAR_OFF = "text-gray-200";

// 1-5 star picker (US8-1). Built as a radio group, so arrow keys move between
// stars and a screen reader reads "4 stars, Very good".
export default function StarRatingInput({ value, onChange, disabled = false, name = "rating", size = 36 }) {
    const [hovered, setHovered] = useState(0);
    const shown = hovered || value || 0;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                role="radiogroup"
                aria-label="Rating"
                className="flex gap-1"
                onMouseLeave={() => setHovered(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <label
                        key={star}
                        onMouseEnter={() => !disabled && setHovered(star)}
                        className={`rounded-md p-0.5 transition-transform has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                            disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={star}
                            checked={value === star}
                            onChange={() => onChange(star)}
                            disabled={disabled}
                            className="sr-only"
                            aria-label={`${star} ${star === 1 ? "star" : "stars"}, ${RATING_LABELS[star]}`}
                        />
                        <StarFilledIcon size={size} className={star <= shown ? STAR_ON : STAR_OFF} />
                    </label>
                ))}
            </div>
            <p className="h-5 text-sm font-medium text-text-main" aria-hidden="true">
                {shown ? RATING_LABELS[shown] : <span className="text-text-muted">Tap a star to rate</span>}
            </p>
        </div>
    );
}

// Read-only stars, e.g. "You rated" on a reviewed booking
export function StarRatingDisplay({ value, size = 16 }) {
    return (
        <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <StarFilledIcon key={star} size={size} className={star <= value ? STAR_ON : STAR_OFF} />
            ))}
        </span>
    );
}
