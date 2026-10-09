import { useState } from "react";
import { MOCK_SCENARIOS, getMockScenario, setMockScenario } from "../../services/mockScenarios";

// Dev-only panel for choosing what each mocked call returns. AppRoutes renders
// it only when VITE_USE_MOCKS=true. Changes apply to the next request.
export default function MockScenarioSwitcher() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(() =>
        Object.fromEntries(Object.keys(MOCK_SCENARIOS).map((name) => [name, getMockScenario(name)])),
    );

    const handleChange = (name, value) => {
        setMockScenario(name, value);
        setSelected((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed bottom-4 left-4 z-[60] text-sm">
            {open && (
                <div className="mb-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                    <p className="mb-3 font-semibold text-text-main">Mock responses</p>
                    <div className="flex flex-col gap-3">
                        {Object.entries(MOCK_SCENARIOS).map(([name, { label, options }]) => (
                            <label key={name} className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-text-muted">{label}</span>
                                <select
                                    value={selected[name]}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {Object.entries(options).map(([value, optionLabel]) => (
                                        <option key={value} value={value}>
                                            {optionLabel}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-text-muted">Applies to the next request. Reload a page to refetch.</p>
                </div>
            )}
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-900 shadow-md ring-1 ring-amber-300 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
                Mocks {open ? "▾" : "▸"}
            </button>
        </div>
    );
}
