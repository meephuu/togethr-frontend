import { useRef, useState } from "react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { ApiError, UsersService } from "../../services/generated";
import { IMAGE_ACCEPT, checkImageFile } from "../../lib/imageFile";

// Upload, replace or remove the signed-in user's profile photo. Saves
// immediately (separately from the profile form) and reports the new URL.
export default function ProfilePhotoField({ photoUrl, firstname, lastname, onChange }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(null); // "upload" | "remove" | null
    const [error, setError] = useState("");

    const describeError = (err, fallback) =>
        err instanceof ApiError
            ? err.body?.error || fallback
            : "Could not connect to the server. Please try again.";

    const handleFile = async (file) => {
        if (!file) return;
        const problem = checkImageFile(file);
        if (problem) {
            setError(problem);
            return;
        }

        setError("");
        setBusy("upload");
        try {
            const response = await UsersService.uploadMyPhoto({ formData: { photo: file } });
            onChange(response.profilePhotoUrl);
        } catch (err) {
            setError(describeError(err, "Could not upload your photo. Please try again."));
        } finally {
            setBusy(null);
        }
    };

    const handleRemove = async () => {
        setError("");
        setBusy("remove");
        try {
            await UsersService.deleteMyPhoto();
            onChange(null);
        } catch (err) {
            setError(describeError(err, "Could not remove your photo. Please try again."));
        } finally {
            setBusy(null);
        }
    };

    return (
        <section aria-labelledby="profile-photo-label" className="mb-8 flex items-center gap-5">
            <Avatar
                photoUrl={photoUrl}
                firstname={firstname}
                lastname={lastname}
                size="lg"
                alt={photoUrl ? "Your profile photo" : ""}
            />
            <div className="flex flex-col gap-2">
                <p id="profile-photo-label" className="text-sm font-medium text-text-main">
                    Profile photo
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        className="h-10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busy !== null}
                        onClick={() => inputRef.current?.click()}
                    >
                        {busy === "upload" ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
                    </Button>
                    {photoUrl && (
                        <button
                            type="button"
                            disabled={busy !== null}
                            onClick={handleRemove}
                            className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-6 text-base font-medium text-red-700 transition-all duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {busy === "remove" ? "Removing…" : "Remove"}
                        </button>
                    )}
                </div>
                <p className="text-xs text-text-muted">JPG or PNG, up to 5 MB.</p>
                {error && (
                    <p className="text-xs text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                tabIndex={-1}
                onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    // Allow picking the same file again.
                    e.target.value = "";
                }}
            />
        </section>
    );
}
