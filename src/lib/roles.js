export const DASHBOARD_BY_ROLE = {
    ADMIN: "/admin/complaints",
    CUSTOMER: "/customer/dashboard",
    PROVIDER: "/provider/dashboard",
};

export function hasRole(user, role) {
    return (user?.roles ?? []).includes(role);
}

// Where to send someone after they sign in. Every provider also holds a customer
// profile, so provider wins when an account has both — otherwise providers would
// always land on the customer side. They can switch from there. Sessions saved
// before roles existed have none, so they fall back to home rather than a
// dashboard they'd only be bounced out of.
export function dashboardFor(user) {
    if (hasRole(user, "ADMIN")) return DASHBOARD_BY_ROLE.ADMIN;
    if (hasRole(user, "PROVIDER")) return DASHBOARD_BY_ROLE.PROVIDER;
    if (hasRole(user, "CUSTOMER")) return DASHBOARD_BY_ROLE.CUSTOMER;
    return "/";
}
