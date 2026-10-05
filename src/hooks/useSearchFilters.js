import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    EMPTY_FILTERS,
    filtersKey,
    getFilterChips,
    parseFilters,
    validateRanges,
    writeFilters,
} from "../lib/searchFilters";

/**
 * The applied search filters, read from and written to the URL query.
 * Each change is a new history entry, so back/forward step through filter
 * changes, and reloads or shared links restore the same filters.
 *
 * - filters: the applied filters (see lib/searchFilters)
 * - key: changes whenever the applied filters change; use it to reset a draft
 * - chips: one per applied filter, for ActiveFilterChips
 * - rangeErrors / isValid: min > max checks; don't search while invalid
 * - applyFilters(next), removeChip(chip), clearAll(): update the URL; doing
 *   nothing when the filters wouldn't change, so no duplicate history entries
 */
export function useSearchFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
    const key = filtersKey(filters);
    const chips = useMemo(() => getFilterChips(filters), [filters]);
    const rangeErrors = useMemo(() => validateRanges(filters), [filters]);

    const applyFilters = useCallback(
        (next) => {
            if (filtersKey(next) === key) return;
            setSearchParams((prev) => writeFilters(prev, next));
        },
        [key, setSearchParams],
    );

    const removeChip = useCallback((chip) => applyFilters(chip.remove(filters)), [applyFilters, filters]);

    // Keeps the keyword `q` and any other non-filter params.
    const clearAll = useCallback(() => applyFilters(EMPTY_FILTERS), [applyFilters]);

    return {
        filters,
        key,
        chips,
        rangeErrors,
        isValid: Object.keys(rangeErrors).length === 0,
        applyFilters,
        removeChip,
        clearAll,
    };
}
