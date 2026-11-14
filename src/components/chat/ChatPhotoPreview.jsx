import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { assetUrl } from "../../lib/assets";
import { XIcon } from "../ui/Icons";

export default function ChatPhotoPreview({ message, onClose }) {
    const dialogRef = useRef(null);
    const downloadRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");
    const url = assetUrl(message.imageUrl);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            downloadRef.current?.abort();
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement) previousFocus.focus();
        };
    }, []);

    async function download() {
        if (downloading) return;
        const controller = new AbortController();
        downloadRef.current = controller;
        setDownloading(true);
        setError("");
        try {
            // Fetch with the login cookie so private photos can be downloaded
            // even when the API and frontend use different origins.
            const response = await fetch(url, { credentials: "include", signal: controller.signal });
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const extension = { "image/png": "png", "image/jpeg": "jpg" }[blob.type];
            if (!extension) throw new Error("Unexpected image type");
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `trip-photo-${message.id}.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (err) {
            if (err.name !== "AbortError") setError("Couldn't download this photo. Please try again.");
        } finally {
            setDownloading(false);
        }
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-label="Photo preview"
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent px-4 py-24 text-white outline-none backdrop:bg-black/85 open:flex open:items-center open:justify-center sm:px-12"
        >
            <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
                <button type="button" onClick={download} disabled={downloading}
                    className="flex h-11 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-medium hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
                    </svg>
                    {downloading ? "Downloading…" : "Download"}
                </button>
                <button type="button" onClick={onClose} autoFocus aria-label="Close photo preview"
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <XIcon size={24} />
                </button>
            </div>
            <img src={url} alt="Shared trip photo, enlarged" onError={() => setError("Couldn't load this photo. Close the preview and try again.")}
                className="max-h-full max-w-full rounded-sm object-contain shadow-2xl" />
            {error && <p role="alert" className="absolute bottom-3 left-4 right-4 text-center text-sm text-red-200">{error}</p>}
        </dialog>,
        document.body,
    );
}
