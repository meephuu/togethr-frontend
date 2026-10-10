// Search filters (US5-2) and their URL form. The URL query is the single source
// of truth: the panel reads it, "Apply filters" writes it, and the results page
// fetches from it. A param is left out while its filter is at the default, so
// plain searches keep clean URLs. Param names are to be confirmed with Max.
//
//   gender=F            M | F | O (omitted = Any)
//   minAge=20&maxAge=35
//   interests=food,photography
//   minPrice=300&maxPrice=800   THB per hour
//   minRating=4         3 | 4 | 4.5 (omitted = Any)

export const GENDER_OPTIONS = [
    { value: "", label: "Any" },
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
];

// Interests are now fetched dynamically from the DB and passed where needed.

export const RATING_OPTIONS = [
    { value: "", label: "Any rating" },
    { value: "3", label: "3 stars & up" },
    { value: "4", label: "4 stars & up" },
    { value: "4.5", label: "4.5 stars & up" },
];

export const FILTER_ERRORS = {
    price: "Minimum price can't be more than the maximum price",
    age: "Minimum age can't be more than the maximum age",
};

// Numbers are kept as the strings typed into the inputs; "" means not set.
export const EMPTY_FILTERS = {
    gender: "",
    minAge: "",
    maxAge: "",
    interests: [],
    minPrice: "",
    maxPrice: "",
    minRating: "",
};

const NUMBER_FIELDS = ["minAge", "maxAge", "minPrice", "maxPrice"];
const FILTER_PARAMS = ["gender", "interests", "minRating", ...NUMBER_FIELDS];

const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value;

// Whole, non-negative numbers only; anything else in the URL is ignored.
function parseCount(raw) {
    if (raw === null || !/^\d+$/.test(raw.trim())) return "";
    return String(Number(raw.trim()));
}

/** Reads the filters from URLSearchParams, dropping values that aren't valid. */
export function parseFilters(searchParams) {
    const gender = searchParams.get("gender") ?? "";
    const minRating = searchParams.get("minRating") ?? "";
    const interests = (searchParams.get("interests") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value, index, all) => value && all.indexOf(value) === index);

    const filters = {
        ...EMPTY_FILTERS,
        gender: GENDER_OPTIONS.some((option) => option.value === gender) ? gender : "",
        minRating: RATING_OPTIONS.some((option) => option.value === minRating) ? minRating : "",
        interests,
    };
    NUMBER_FIELDS.forEach((field) => {
        filters[field] = parseCount(searchParams.get(field));
    });
    return filters;
}

/**
 * Returns new URLSearchParams with the filter params replaced. Other params
 * (the keyword `q`, sorting...) are kept; `page` is dropped so a filter
 * change starts again from page 1.
 */
export function writeFilters(searchParams, filters) {
    const next = new URLSearchParams(searchParams);
    [...FILTER_PARAMS, "page"].forEach((param) => next.delete(param));

    if (filters.gender) next.set("gender", filters.gender);
    if (filters.minAge !== "") next.set("minAge", filters.minAge);
    if (filters.maxAge !== "") next.set("maxAge", filters.maxAge);
    if (filters.interests.length > 0) next.set("interests", filters.interests.join(","));
    if (filters.minPrice !== "") next.set("minPrice", filters.minPrice);
    if (filters.maxPrice !== "") next.set("maxPrice", filters.maxPrice);
    if (filters.minRating) next.set("minRating", filters.minRating);
    return next;
}

/** Stable key for a set of filters, e.g. to tell whether anything changed. */
export function filtersKey(filters) {
    return writeFilters(new URLSearchParams(), filters).toString();
}

/** { price?, age? } for each min/max pair where min is more than max. */
export function validateRanges(filters) {
    const errors = {};
    const inverted = (min, max) => min !== "" && max !== "" && Number(min) > Number(max);
    if (inverted(filters.minPrice, filters.maxPrice)) errors.price = FILTER_ERRORS.price;
    if (inverted(filters.minAge, filters.maxAge)) errors.age = FILTER_ERRORS.age;
    return errors;
}

const baht = (value) => `฿${Number(value).toLocaleString("en-US")}`;

function rangeLabel(min, max, { both, minOnly, maxOnly }) {
    if (min !== "" && max !== "") return both(min, max);
    if (min !== "") return minOnly(min);
    return maxOnly(max);
}

/**
 * One chip per applied filter, in the panel's order. `remove` returns the
 * filters without that chip; age and price chips clear both ends of the range.
 */
export function getFilterChips(filters) {
    const chips = [];

    if (filters.gender) {
        chips.push({
            key: "gender",
            label: labelOf(GENDER_OPTIONS, filters.gender),
            remove: (f) => ({ ...f, gender: "" }),
        });
    }
    if (filters.minAge !== "" || filters.maxAge !== "") {
        chips.push({
            key: "age",
            label: rangeLabel(filters.minAge, filters.maxAge, {
                both: (min, max) => `Age ${min}–${max}`,
                minOnly: (min) => `Age ${min}+`,
                maxOnly: (max) => `Age up to ${max}`,
            }),
            remove: (f) => ({ ...f, minAge: "", maxAge: "" }),
        });
    }
    filters.interests.forEach((interest) => {
        chips.push({
            key: `interest-${interest}`,
            label: interest,
            remove: (f) => ({ ...f, interests: f.interests.filter((value) => value !== interest) }),
        });
    });
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
        chips.push({
            key: "price",
            label: rangeLabel(filters.minPrice, filters.maxPrice, {
                both: (min, max) => `${baht(min)}–${Number(max).toLocaleString("en-US")}`,
                minOnly: (min) => `${baht(min)}+`,
                maxOnly: (max) => `Up to ${baht(max)}`,
            }),
            remove: (f) => ({ ...f, minPrice: "", maxPrice: "" }),
        });
    }
    if (filters.minRating) {
        chips.push({
            key: "rating",
            label: labelOf(RATING_OPTIONS, filters.minRating),
            remove: (f) => ({ ...f, minRating: "" }),
        });
    }

    return chips;
}
