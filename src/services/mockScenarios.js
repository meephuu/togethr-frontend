// Which response each mocked call returns when VITE_USE_MOCKS=true. Picked in
// the "Mocks" switcher (components/dev/MockScenarioSwitcher) and kept in
// localStorage, so a scenario survives reloads. The first option is the default.

const STORAGE_KEY = "togethr.mockScenarios";

export const MOCK_SCENARIOS = {
    categories: {
        label: "Service categories",
        options: {
            list: "Categories list",
            network: "Network error",
        },
    },
    createService: {
        label: "Publish service",
        options: {
            success: "Success (201)",
            validation: "Validation errors (400)",
            network: "Network error",
        },
    },
    search: {
        label: "Search results",
        options: {
            results: "Matching services",
            empty: "No results",
            network: "Network error",
        },
    },
    myServices: {
        label: "My services",
        options: {
            list: "Services list",
            empty: "Empty list",
            network: "Network error",
        },
    },
    bookingRequests: {
        label: "Booking requests",
        options: {
            list: "Waiting, confirmed & past",
            empty: "No requests",
            network: "Network error",
        },
    },
    bookingDecision: {
        label: "Accept / reject",
        options: {
            success: "Success (200)",
            expired: "Request expired (409)",
            network: "Network error",
        },
    },
    myBookings: {
        label: "My bookings",
        options: {
            list: "Upcoming & past",
            empty: "No bookings",
            network: "Network error",
        },
    },
    cancelBooking: {
        label: "Cancel booking",
        options: {
            success: "Success (200)",
            started: "Already started (409)",
            network: "Network error",
        },
    },
    editService: {
        label: "Save service changes",
        options: {
            success: "Success (200)",
            validation: "Validation errors (400)",
            network: "Network error",
        },
    },
    unpublishService: {
        label: "Unpublish service",
        options: {
            success: "No pending requests (200)",
            pending: "Has a pending request (409)",
            network: "Network error",
        },
    },
    availability: {
        label: "Availability",
        options: {
            list: "Has open & booked dates",
            empty: "No dates set",
            network: "Network error",
        },
    },
};

// In-memory copy, so switching still works for this tab when storage is blocked.
let current = null;

function readStored() {
    if (current) return current;
    try {
        current = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        current = {};
    }
    return current;
}

export function getMockScenario(name) {
    const options = Object.keys(MOCK_SCENARIOS[name].options);
    const stored = readStored()[name];
    return options.includes(stored) ? stored : options[0];
}

export function setMockScenario(name, value) {
    current = { ...readStored(), [name]: value };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
        // storage blocked: the choice lasts until this tab reloads
    }
}
