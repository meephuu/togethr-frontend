import { CheckIcon, XIcon } from "./Icons";

// Success toast, top right under the sticky Navbar (and its tab row). Stays until dismissed.
export default function Toast({ title, children, onDismiss }) {
    return (
        <div
            role="status"
            className="fixed right-4 top-36 z-40 flex w-[380px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg sm:right-8"
        >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckIcon size={16} />
            </span>
            <div className="flex flex-1 flex-col gap-0.5 text-sm">
                <p className="font-semibold text-text-main">{title}</p>
                {children}
            </div>
            <button
                type="button"
                aria-label="Dismiss"
                onClick={onDismiss}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-secondary hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <XIcon size={16} />
            </button>
        </div>
    );
}
