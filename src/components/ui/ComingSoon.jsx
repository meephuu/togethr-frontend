// Stand-in for a link whose page doesn't exist yet (service detail US5-3,
// availability US4-2). Swap for a <Link> once the route is built.
export default function ComingSoon({ children, className = "" }) {
    return (
        <span aria-disabled="true" title="Coming soon" className={`cursor-not-allowed text-text-muted ${className}`}>
            {children}
        </span>
    );
}
