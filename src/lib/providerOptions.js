// Choices for the provider details on the profile page (US3-2).
// Interest values match INTEREST_OPTIONS in Euro's searchFilters.js so the
// saved data works with the search filter (US5-2).

export const LANGUAGE_OPTIONS = ["Thai", "English", "Chinese", "Japanese", "Korean", "French", "German"];

export const INTEREST_OPTIONS = [
    { value: "food", label: "Food" },
    { value: "photography", label: "Photography" },
    { value: "temples-culture", label: "Temples & culture" },
    { value: "shopping", label: "Shopping" },
    { value: "nightlife", label: "Nightlife" },
    { value: "nature", label: "Nature" },
    { value: "hiking", label: "Hiking" },
];

export const SERVICE_AREA_OPTIONS = [
    "Bangkok",
    "Nonthaburi",
    "Pathum Thani",
    "Samut Prakan",
    "Chiang Mai",
    "Phuket",
    "Chonburi",
];

// Accepts the comma string stored for languages ("Thai, English") or an array.
export const toArray = (value) =>
    Array.isArray(value)
        ? value
        : value
          ? String(value)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
          : [];

export const interestLabel = (value) =>
    INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value;
