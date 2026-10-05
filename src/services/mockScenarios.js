// Which response each mocked call returns when VITE_USE_MOCKS=true. Picked in
// the "Mocks" switcher (components/dev/MockScenarioSwitcher) and kept in
// localStorage, so a scenario survives reloads. The first option is the default.

const STORAGE_KEY = "togethr.mockScenarios";

export const MOCK_SCENARIOS = {
    providerStatus: {
        label: "Provider status",
        options: {
            approved: "Approved",
            pending: "Pending approval",
            network: "Network error",
        },
    },
    createService: {
        label: "Publish service",
        options: {
            success: "Success (201)",
            validation: "Validation errors (400)",
            notApproved: "Not approved (403)",
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
