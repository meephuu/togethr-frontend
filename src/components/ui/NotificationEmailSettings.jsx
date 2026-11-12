import { useEffect, useState } from "react";
import { getNotificationSettings, updateNotificationSettings } from "../../services/notificationSettingsApi";

export default function NotificationEmailSettings() {
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        getNotificationSettings().then((value) => {
            if (active) { setSettings(value); setError(""); }
        }).catch(() => {
            if (active) setError("Couldn't load your email setting. Please try again.");
        });
        return () => { active = false; };
    }, [reload]);

    async function toggle(enabled) {
        setSaving(true);
        setSaved(false);
        setError("");
        try {
            const value = await updateNotificationSettings(enabled);
            setSettings(value);
            setSaved(true);
        } catch {
            setError("Couldn't save your email setting. Please try again.");
        } finally { setSaving(false); }
    }

    return (
        <div className="flex h-[279px] flex-col items-center justify-center gap-3 px-5 text-primary" aria-label="Notification settings">
            {settings ? (
                <label className="flex cursor-pointer items-center gap-3 text-sm text-text-main">
                    <input type="checkbox" checked={settings.emailNotificationsEnabled} disabled={saving}
                        onChange={(event) => toggle(event.target.checked)}
                        className="h-6 w-6 shrink-0 cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-wait" />
                    Receive notifications via Email
                </label>
            ) : !error && <p role="status" className="text-sm text-text-muted">Loading email setting…</p>}
            <p role="status" className="h-4 text-xs text-text-muted">{saving ? "Saving…" : saved ? "Saved" : ""}</p>
            {error && <div role="alert" className="text-center text-sm text-red-700">
                <p>{error}</p>
                {!settings && <button type="button" className="mt-2 font-semibold underline" onClick={() => { setError(""); setReload((value) => value + 1); }}>Try again</button>}
            </div>}
        </div>
    );
}
