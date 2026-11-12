import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import Button from "../ui/Button";
import { ImageIcon, XIcon } from "../ui/Icons";
import { cropToJpeg } from "../../lib/cropImage";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

// Square crop with a round mask for the profile photo. Drag to reposition,
// zoom with the slider (or the wheel / pinch). onSave gets a ~512×512 JPEG File.
export default function PhotoCropDialog({ src, onCancel, onSave }) {
    const zoomRef = useRef(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [area, setArea] = useState(null); // in the image's own pixels
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const close = () => {
        if (!isSaving) onCancel();
    };

    useEffect(() => {
        zoomRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isSaving) onCancel();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSaving, onCancel]);

    const handleSave = async () => {
        if (!area) return;
        setIsSaving(true);
        setError("");
        try {
            onSave(await cropToJpeg(src, area));
        } catch {
            setIsSaving(false);
            setError("Could not crop this photo. Please try another one.");
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4" onClick={close}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="photo-crop-title"
                aria-describedby="photo-crop-description"
                className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary">
                            <ImageIcon size={20} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h2 id="photo-crop-title" className="font-heading text-base font-semibold text-text-main">
                                Crop your photo
                            </h2>
                            <p id="photo-crop-description" className="text-[13px] text-text-muted">
                                Drag to reposition, and zoom in or out.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        disabled={isSaving}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 overflow-y-auto thin-scrollbar px-6 py-5">
                    <div className="relative h-72 w-full overflow-hidden rounded-xl bg-gray-900">
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            minZoom={MIN_ZOOM}
                            maxZoom={MAX_ZOOM}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, pixels) => setArea(pixels)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="photo-crop-zoom" className="text-sm font-medium text-text-main">
                            Zoom
                        </label>
                        <input
                            ref={zoomRef}
                            id="photo-crop-zoom"
                            type="range"
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            aria-valuetext={`${Math.round(zoom * 100)}%`}
                            disabled={isSaving}
                            className="w-full accent-primary"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600" role="alert">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <Button type="button" variant="secondary" className="h-10" onClick={close} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="h-10 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleSave}
                        disabled={!area || isSaving}
                    >
                        {isSaving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
