// Reusable hook that keeps a grid's configuration (sort, per-column filters, which columns
// are shown, their order, and any resized widths) in the URL so a view can be bookmarked or
// shared, while still honoring the user's personal column preferences stored in localStorage.
//
// Why we touch the URL with native history.replaceState instead of react-router /
// use-query-params: the filter row is a free-typing text input. Writing the URL through the
// router re-renders the routed tree on every keystroke, which blurs the input and drops
// characters. replaceState updates the address bar WITHOUT a navigation/re-render, so typing
// stays smooth. Grid state therefore lives in local React state (the source of truth for the
// controlled grid); the URL is a live mirror we (a) seed from on mount, (b) write on change,
// and (c) re-read on back/forward (popstate).
//
// Caveat (intentional/benign): because we use native replaceState, react-router's internal
// `history.location` does not learn about these query-string changes. That is fine here: the
// grid lives on a path-segment route (/grid/:filter*), nothing on the page reads the grid
// params from the router, and all navigation off these pages uses absolute hrefs (BlorgLink),
// so the stale router search is never used to compose a destination. Real Back/Forward fires a
// genuine popstate, which both react-router and the listener below handle.
//
// Precedence on load: a dimension present in the URL wins; otherwise we fall back to
// localStorage (for column order/visibility) or the column-definition defaults.
//
// The URL speaks in each column's short `urlKey` (see gridUrlConfig); internally the grid uses
// the column `name`. This hook maps name->key when writing and parseGridConfigFromSearch maps
// key->name when reading.
//
// Assumes one grid instance per route (the params sort/cols/widths + per-column filter keys are
// global to the query string; storageKeyPrefix namespaces only localStorage).

import { useEffect, useMemo, useRef, useState } from "react";
import { useStorageState } from "react-storage-hooks";
import { Filter as GridFilter, Sorting } from "@devexpress/dx-react-grid";
import { IGridColumn } from "./GridColumns";
import {
    parseGridConfigFromSearch,
    reconcileColumnOrder,
    dropUnknownColumns,
    mergeColumnWidths,
    encodeVisibleOrder,
    encodeSortings,
    encodeWidths,
    urlKeyForColumn,
    nameToUrlKeyMap,
    findUrlKeyProblems,
    RESERVED_GRID_PARAM_KEYS,
    IColumnWidth,
} from "./gridUrlConfig";

export interface IGridConfigInUrl {
    sortings: Sorting[];
    setSortings: (sortings: Sorting[]) => void;
    gridFilters: GridFilter[];
    setGridFilters: (filters: GridFilter[]) => void;
    columnNamesInDisplayOrder: string[];
    setColumnNamesInDisplayOrder: (order: string[]) => void;
    hiddenColumnNames: string[];
    setHiddenColumnNames: (hidden: string[]) => void;
    columnWidths: IColumnWidth[];
    setColumnWidths: (widths: IColumnWidth[]) => void;
}

// storageKeyPrefix is e.g. "book-grid" / "language-grid"; it must match the keys the grids
// used before so existing users keep their saved column preferences. initialFilters seeds the
// per-column filters when the URL has none (e.g. the bulk-edit page opens the grid pre-filtered).
export function useGridConfigInUrl(
    columnDefinitions: ReadonlyArray<IGridColumn>,
    storageKeyPrefix: string,
    options?: { initialFilters?: GridFilter[] }
): IGridConfigInUrl {
    const allColumnNames = useMemo(() => columnDefinitions.map((c) => c.name), [
        columnDefinitions,
    ]);
    const defaultHidden = useMemo(
        () =>
            columnDefinitions
                .filter((c) => !c.defaultVisible)
                .map((c) => c.name),
        [columnDefinitions]
    );
    const sortableNames = useMemo(
        () =>
            new Set(
                columnDefinitions
                    .filter((c) => c.sortingEnabled)
                    .map((c) => c.name)
            ),
        [columnDefinitions]
    );
    const nameToKey = useMemo(() => nameToUrlKeyMap(columnDefinitions), [
        columnDefinitions,
    ]);
    const toKey = (name: string) => nameToKey.get(name) ?? name;

    // Dev-time guard: a duplicated or reserved urlKey would silently lose a column's
    // filter/sort/etc. in the URL. Surface it loudly during development.
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            const problems = findUrlKeyProblems(columnDefinitions);
            if (problems.length)
                // eslint-disable-next-line no-console
                console.error(
                    `[${storageKeyPrefix}] grid urlKey problems:\n` +
                        problems.join("\n")
                );
        }
    }, [columnDefinitions, storageKeyPrefix]);

    // Personal defaults: same localStorage keys the grids used before this feature.
    const [storedOrder, setStoredOrder] = useStorageState<string[]>(
        localStorage,
        `${storageKeyPrefix}-column-order`,
        allColumnNames
    );
    const [storedHidden, setStoredHidden] = useStorageState<string[]>(
        localStorage,
        `${storageKeyPrefix}-column-hidden`,
        defaultHidden
    );

    // A sort is only meaningful for a column that is both real and sortable.
    const onlyValidSortings = (sortings: Sorting[] | undefined) =>
        (sortings ?? []).filter((s) => sortableNames.has(s.columnName));
    const onlyKnownFilters = (filters: GridFilter[] | undefined) => {
        const known = new Set(allColumnNames);
        return (filters ?? []).filter((f) => known.has(f.columnName));
    };

    // Parse the URL exactly once (mount). Reads of window.location here are intentional: the
    // URL, not props, is the initial source of truth. (Memo deps are stable -> effectively
    // mount-only; the result is consumed solely by the useState initializers below.)
    const initial = useMemo(
        () =>
            parseGridConfigFromSearch(
                window.location.search,
                columnDefinitions
            ),
        [columnDefinitions]
    );

    const [sortings, setSortingsState] = useState<Sorting[]>(() =>
        onlyValidSortings(initial.sortings)
    );
    const [gridFilters, setFiltersState] = useState<GridFilter[]>(() =>
        onlyKnownFilters(initial.filters ?? options?.initialFilters)
    );
    // order + hidden come together from the URL's `cols` (visible-in-order); if absent, fall
    // back to the personal localStorage layout (order/hidden are stored separately there).
    const [columnNamesInDisplayOrder, setOrderState] = useState<string[]>(() =>
        reconcileColumnOrder(initial.order ?? storedOrder, allColumnNames)
    );
    const [hiddenColumnNames, setHiddenState] = useState<string[]>(() =>
        dropUnknownColumns(initial.hidden ?? storedHidden, allColumnNames)
    );
    const [columnWidths, setWidthsState] = useState<IColumnWidth[]>(() =>
        mergeColumnWidths(allColumnNames, initial.widths)
    );

    // --- write a single dimension to the address bar without causing a re-render ---

    const commitSearch = (params: URLSearchParams) => {
        // URLSearchParams.toString() percent-encodes "," and ":" even though both are legal
        // and readable in a query string. Un-encode just those two separators so the URL reads
        // `show=ca,ph` / `sort=ti:desc` instead of `show=ca%2Cph`. Structural characters in
        // filter values (&, =, #, space) stay encoded, and parsing handles either form.
        const q = params.toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
        const url =
            window.location.pathname +
            (q ? "?" + q : "") +
            window.location.hash;
        // Preserve window.history.state so react-router/history v4's navigation key survives.
        window.history.replaceState(window.history.state, "", url);
    };
    const writeParam = (key: string, value: string | undefined) => {
        const params = new URLSearchParams(window.location.search);
        if (value === undefined) params.delete(key);
        else params.set(key, value);
        commitSearch(params);
    };
    const writeFilters = (filters: GridFilter[]) => {
        const params = new URLSearchParams(window.location.search);
        const reserved = new Set(RESERVED_GRID_PARAM_KEYS);
        // Clear every per-column filter key, then set the active ones. Leaves
        // sort/cols/hidden/widths and any unrelated params alone.
        for (const c of columnDefinitions) {
            const k = urlKeyForColumn(c);
            if (!reserved.has(k)) params.delete(k);
        }
        for (const f of filters) {
            if (f.value === undefined || f.value === null || f.value === "")
                continue;
            const key = toKey(f.columnName);
            if (!reserved.has(key)) params.set(key, String(f.value));
        }
        commitSearch(params);
    };
    // `cols` carries visibility + order together (see gridUrlConfig). Both setColumns and
    // setHidden funnel through here. encodeVisibleOrder returns undefined when the view matches
    // the factory default, so writeParam then removes `cols` and the URL stays clean.
    const writeVisibleOrder = (order: string[], hidden: string[]) => {
        writeParam(
            "cols",
            encodeVisibleOrder(order, hidden, columnDefinitions)
        );
    };

    // --- back/forward (and manual URL edits): re-read the URL into local state ---

    // Keep the latest fallbacks in a ref so the popstate listener doesn't need to re-bind.
    const fallbackRef = useRef({
        storedOrder,
        storedHidden,
        initialFilters: options?.initialFilters,
    });
    fallbackRef.current = {
        storedOrder,
        storedHidden,
        initialFilters: options?.initialFilters,
    };
    useEffect(() => {
        const onPop = () => {
            const cfg = parseGridConfigFromSearch(
                window.location.search,
                columnDefinitions
            );
            setSortingsState(onlyValidSortings(cfg.sortings));
            // Mirror mount precedence: URL filters win; else the seeded initialFilters.
            setFiltersState(
                onlyKnownFilters(
                    cfg.filters ?? fallbackRef.current.initialFilters
                )
            );
            setOrderState(
                reconcileColumnOrder(
                    cfg.order ?? fallbackRef.current.storedOrder,
                    allColumnNames
                )
            );
            setHiddenState(
                dropUnknownColumns(
                    cfg.hidden ?? fallbackRef.current.storedHidden,
                    allColumnNames
                )
            );
            setWidthsState(mergeColumnWidths(allColumnNames, cfg.widths));
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnDefinitions, allColumnNames, sortableNames]);

    // On a BARE url (no grid params at all), backfill the address bar from the user's current
    // (localStorage-derived) view so the URL is shareable without manually toggling everything.
    // encodeVisibleOrder writes nothing when the layout matches the factory default, so a bare
    // default view stays bare. A URL that already carries any grid param is treated as
    // explicit/shared and left untouched -- we never inject one viewer's saved layout into
    // someone else's link. (Only column order/visibility live in localStorage; sort, filters and
    // widths are URL-only, so on a bare url they're empty and nothing is written for them.)
    const didBackfillRef = useRef(false);
    useEffect(() => {
        if (didBackfillRef.current) return;
        didBackfillRef.current = true;
        const urlHadGridConfig = !!(
            (initial.sortings && initial.sortings.length) ||
            (initial.filters && initial.filters.length) ||
            initial.order ||
            (initial.widths && initial.widths.length)
        );
        if (urlHadGridConfig) return;
        writeVisibleOrder(columnNamesInDisplayOrder, hiddenColumnNames);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        sortings,
        setSortings: (next: Sorting[]) => {
            setSortingsState(next);
            writeParam(
                "sort",
                encodeSortings(
                    next.map((s) => ({ ...s, columnName: toKey(s.columnName) }))
                )
            );
        },
        gridFilters,
        setGridFilters: (next: GridFilter[]) => {
            // Local state first (snappy, focused typing); replaceState mirror second (no
            // re-render, so the focused input is never disturbed).
            setFiltersState(next);
            writeFilters(next);
        },
        columnNamesInDisplayOrder,
        setColumnNamesInDisplayOrder: (next: string[]) => {
            setOrderState(next);
            setStoredOrder(next); // update personal default too
            // `cols` encodes visible-columns-in-order, so it depends on the current hidden set.
            writeVisibleOrder(next, hiddenColumnNames);
        },
        hiddenColumnNames,
        setHiddenColumnNames: (next: string[]) => {
            setHiddenState(next);
            setStoredHidden(next); // update personal default too
            writeVisibleOrder(columnNamesInDisplayOrder, next);
        },
        columnWidths,
        setColumnWidths: (next: IColumnWidth[]) => {
            setWidthsState(next);
            // encodeWidths keeps only resized columns; all-auto => param removed.
            writeParam(
                "widths",
                encodeWidths(
                    next.map((w) => ({ ...w, columnName: toKey(w.columnName) }))
                )
            );
        },
    };
}
