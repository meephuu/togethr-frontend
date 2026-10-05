// Stroke icons (Lucide paths) shared by the Sprint 2 pages. Decorative by
// default: pair them with visible text or an aria-label on the parent.

function Svg({ size = 20, className = "", children }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 ${className}`}
        >
            {children}
        </svg>
    );
}

export const UploadIcon = (props) => (
    <Svg {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m17 8-5-5-5 5" />
        <path d="M12 3v12" />
    </Svg>
);

export const ImageIcon = (props) => (
    <Svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Svg>
);

export const MapPinIcon = (props) => (
    <Svg {...props}>
        <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
);

export const CheckIcon = (props) => (
    <Svg {...props}>
        <path d="M20 6 9 17l-5-5" />
    </Svg>
);

export const XIcon = (props) => (
    <Svg {...props}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </Svg>
);

export const AlertCircleIcon = (props) => (
    <Svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
    </Svg>
);

export const ClockIcon = (props) => (
    <Svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Svg>
);

export const BriefcaseIcon = (props) => (
    <Svg {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Svg>
);

export const CalendarIcon = (props) => (
    <Svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
    </Svg>
);

export const PlusIcon = (props) => (
    <Svg {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </Svg>
);
