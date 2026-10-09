import { CheckIcon, XIcon } from "../ui/Icons";

// "Ready to publish" list. Unmet rules stay neutral until the first publish
// attempt (showFailures), then turn into a red ✕.
export default function PublishChecklist({ items, showFailures }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-sm font-semibold text-text-main">Ready to publish</p>
            <ul className="flex flex-col gap-3">
                {items.map((item) => {
                    const failed = !item.done && showFailures;
                    return (
                        <li
                            key={item.key}
                            className={`flex items-center gap-2.5 text-sm ${
                                item.done ? "text-text-main" : failed ? "text-red-600" : "text-text-muted"
                            }`}
                        >
                            {item.done ? (
                                <CheckIcon size={18} className="text-emerald-700" />
                            ) : failed ? (
                                <XIcon size={18} />
                            ) : (
                                <span className="mx-[3px] h-3 w-3 rounded-full border-2 border-gray-300" aria-hidden="true" />
                            )}
                            {item.label}
                            <span className="sr-only">{item.done ? "(done)" : "(not done)"}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
