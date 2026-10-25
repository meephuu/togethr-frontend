import { useTheme } from "../../hooks/useTheme";
import { CARD_CLASS } from "../../lib/styles";

// The "Theme" switch under the Save Changes button on the profile edit page.
// It applies immediately and is remembered in this browser, so it doesn't go
// through the form's Save Changes.
export default function ThemeSection() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <section aria-labelledby="theme-heading" className={`${CARD_CLASS} mt-12 p-6`}>
            <h2 id="theme-heading" className="text-lg text-text-main">Theme</h2>
            <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                    <p id="theme-label" className="text-sm font-medium text-text-main">
                        Dark mode
                    </p>
                    <p id="theme-hint" className="mt-1 text-xs leading-normal text-text-muted">
                        {isDark ? "Dark theme is on." : "Light theme is on."} Saved on this device.
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-labelledby="theme-label"
                    aria-describedby="theme-hint"
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isDark ? "bg-primary" : "bg-gray-300"
                    }`}
                >
                    <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 transform rounded-full bg-[#ffffff] shadow transition-transform duration-200 ${
                            isDark ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                </button>
            </div>
        </section>
    );
}
