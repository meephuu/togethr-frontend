const STATUS = {
    PUBLISHED: { label: "Published", className: "bg-emerald-50 text-emerald-700" },
    UNPUBLISHED: { label: "Unpublished", className: "bg-secondary text-gray-600" },
};

export default function ServiceStatusPill({ status }) {
    const { label, className } = STATUS[status] ?? { label: status, className: "bg-secondary text-gray-600" };

    return (
        <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
            {label}
        </span>
    );
}
