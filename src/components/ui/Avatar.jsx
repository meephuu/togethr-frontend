import { useState } from "react";
import { assetUrl } from "../../lib/assets";

const SIZES = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-base",
    lg: "h-24 w-24 text-2xl",
};

// Round profile photo, or the person's initials when there's no photo (or it
// fails to load). Decorative by default: show the name next to it, or pass alt.
export default function Avatar({ photoUrl, firstname, lastname, size = "md", alt = "", className = "" }) {
    const [failedUrl, setFailedUrl] = useState(null);
    const showPhoto = photoUrl && failedUrl !== photoUrl;
    const classes = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${SIZES[size]} ${className}`;

    if (showPhoto) {
        return (
            <img
                src={assetUrl(photoUrl)}
                alt={alt}
                onError={() => setFailedUrl(photoUrl)}
                className={`${classes} bg-gray-100 object-cover`}
            />
        );
    }

    const initials = `${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase() || "?";
    return (
        <span aria-hidden={alt ? undefined : "true"} aria-label={alt || undefined} role={alt ? "img" : undefined} className={`${classes} bg-primary/10 font-semibold text-primary`}>
            {initials}
        </span>
    );
}
