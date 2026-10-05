import { useRef, useState } from "react";
import Button from "../ui/Button";
import { UploadIcon } from "../ui/Icons";
import { CARD_CLASS } from "../../lib/styles";
import { formatFileSize } from "../../lib/format";
import { COVER_PHOTO_ACCEPT } from "../../lib/serviceValidation";

// Drop zone + browse for the cover photo. The parent checks the file
// (type/size) in onSelect and owns the preview URL.
export default function CoverPhotoPicker({ file, previewUrl, error, onSelect, onRemove }) {
    const inputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const openPicker = () => inputRef.current?.click();

    const handleFiles = (files) => {
        const picked = files?.[0];
        if (picked) onSelect(picked);
    };

    const handleRemove = () => {
        onRemove();
        // The Remove button disappears with the photo; keep focus in this section.
        requestAnimationFrame(() => dropZoneRef.current?.focus());
    };

    const dropZoneState = error
        ? "border-red-600 bg-red-50"
        : isDragging
          ? "border-primary bg-secondary"
          : "border-gray-300 bg-gray-50 hover:border-primary";

    return (
        <section className={`${CARD_CLASS} flex flex-col gap-4 p-6 sm:p-8`} aria-labelledby="cover-photo-heading">
            <div className="flex flex-col gap-1">
                <h2 id="cover-photo-heading" className="text-lg text-text-main">
                    Cover photo
                </h2>
                <p className="text-sm text-text-muted">The first thing customers see on your listing.</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={COVER_PHOTO_ACCEPT}
                className="hidden"
                tabIndex={-1}
                onChange={(e) => {
                    handleFiles(e.target.files);
                    // Allow picking the same file again after Remove.
                    e.target.value = "";
                }}
            />

            {file && previewUrl ? (
                <>
                    <img
                        src={previewUrl}
                        alt="Cover photo preview"
                        className="h-56 w-full rounded-xl bg-gray-100 object-cover sm:h-[360px]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="break-all text-sm text-text-muted">
                            {file.name} · {formatFileSize(file.size)}
                        </span>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" className="h-10" onClick={openPicker}>
                                Replace
                            </Button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-6 text-base font-medium text-red-700 transition-all duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <button
                    ref={dropZoneRef}
                    type="button"
                    onClick={openPicker}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFiles(e.dataTransfer.files);
                    }}
                    aria-describedby={error ? "cover-photo-error" : undefined}
                    className={`flex h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary sm:h-[360px] ${dropZoneState}`}
                >
                    <UploadIcon size={40} />
                    <span className="text-base text-text-main">
                        Drag a photo here or <span className="font-semibold text-primary underline">browse</span>
                    </span>
                    <span className="text-[13px]">JPG or PNG, up to 5 MB · 1600 × 900 px recommended</span>
                </button>
            )}

            {error && (
                <p id="cover-photo-error" className="text-xs text-red-600">
                    {error}
                </p>
            )}
        </section>
    );
}
