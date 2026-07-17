// Reusable hook that keeps a grid's configuration (sort, per-column filters, which columns
// are shown, their order, and any resized widths) in the URL so a view can be bookmarked or
// shared. At runtime the URL is the ONLY source of grid configuration: params present in the
// URL win, and anything absent means the column-definition defaults -- with one mount-time
// exception: the user's personal saved view -- column order/visibility, sort, and widths
// (never filters) -- is remembered in localStorage as the same compact strings the URL params
// use, and a BARE url (no grid params at all) is seeded from it and immediately backfilled
// into the address bar, after which the URL-only rule holds. See "personal saved view" below.
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
// Precedence on load: a dimension present in the URL wins; a completely bare URL gets the
// personal saved view (cols/sort/widths); otherwise the column-definition defaults (plus the
// caller's initialFilters seeding, e.g. the bulk-edit page).
//
// The URL speaks in each column's short `urlKey` (see gridUrlConfig); internally the grid uses
// the column `name`. This hook maps name->key when writing and parseGridConfigFromSearch maps
// key->name when reading.
//
// Assumes one grid instance per route (the params sort/cols/widths + per-column filter keys are
// global to the query string; gridName namespaces the personal saved view in localStorage).

import { useEffect, useMemo, useRef, useState } from "react";
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
    IGridConfigFromUrl,
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
    // One click back to the factory-default view (columns/order, sort, widths -- not filters,
    // which have their own Clear Filters button). Also forgets the personal saved view.
    resetView: () => void;
}

// gridName (e.g. "book-grid") namespaces the personal saved view in localStorage and labels
// dev-time diagnostics. initialFilters seeds the
// per-column filters when the URL has none (e.g. the bulk-edit page opens the grid pre-filtered).
// availableColumnNames (optional) is the set of columns THIS user may see (see
// getColumnsVisibleToUser). A shared/bookmarked URL can name a column the viewer lacks (e.g. a
// moderator-only column); such sort/filter entries are ignored in what we hand back to the grid,
// so nobody ends up sorting/filtering by a column they can neither see nor clear. Defaults to all
// columns when the caller doesn't supply it. Pass a value that's stable across renders (memoize).
export function useGridConfigInUrl(
    columnDefinitions: ReadonlyArray<IGridColumn>,
    gridName: string,
    options?: {
        initialFilters?: GridFilter[];
        availableColumnNames?: ReadonlyArray<string>;
    }
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
                    `[${gridName}] grid urlKey problems:\n` +
                        problems.join("\n")
                );
        }
    }, [columnDefinitions, gridName]);

    // -----------------------------------------------------------------------
    // personal saved view (column order/visibility, sort, widths -- never filters)
    // -----------------------------------------------------------------------
    // The user's last column layout (`cols`), sort, and column widths are remembered as the
    // SAME compact strings the URL params use (see gridUrlConfig), so restoring is literally
    // "as if your last cols/sort/widths were in the URL" -- one pipeline, nothing to drift.
    // Filters are deliberately NOT remembered: a filter silently re-applied on a later visit
    // reads as "where did my books go?", and it would fight the bulk-edit initialFilters
    // seeding. The saved view acts only at mount: a BARE url (no grid params at all) is
    // seeded from it, and the backfill effect below then writes it into the address bar, so
    // after mount the URL is once again the only source of truth. A URL that already carries
    // any grid param is an explicit/shared view and is never mixed with the personal one.
    // Each dimension is saved when the user changes it and removed when it returns to its
    // factory default (mirroring when the URL param exists).
    //
    // Why this can't re-create BL-16569 (moderator columns missing after login): the layout
    // state spans the full column namespace regardless of who is logged in, and the column
    // chooser never offers a gated column to a user who lacks it, so a layout saved while
    // logged out still lists the moderator columns as visible. (Like a bookmarked URL, though,
    // a saved layout is an exact snapshot: a column added in a later release stays hidden for
    // a user with a saved layout until re-chosen or reset.)
    const savedKey = (param: string) => `${gridName}-${param}`;
    const writeSaved = (param: string, value: string | undefined) => {
        try {
            if (value === undefined)
                window.localStorage.removeItem(savedKey(param));
            else window.localStorage.setItem(savedKey(param), value);
        } catch {
            // localStorage unavailable/full: the view just isn't remembered.
        }
    };
    // One-time migration from the two-key JSON format the grids used before BL-16569 (raw
    // order/hidden name arrays; sort and widths were never persisted in that era): the old
    // arrays go through the same reconciliation the URL path uses, the result is saved under
    // the new key, and the old keys are deleted.
    const migrateLegacySavedLayout = (): string | undefined => {
        const legacyOrder = window.localStorage.getItem(
            `${gridName}-column-order`
        );
        const legacyHidden = window.localStorage.getItem(
            `${gridName}-column-hidden`
        );
        if (legacyOrder === null && legacyHidden === null) return undefined;
        // Delete first so even a malformed value is purged rather than retried forever.
        window.localStorage.removeItem(`${gridName}-column-order`);
        window.localStorage.removeItem(`${gridName}-column-hidden`);
        const order = reconcileColumnOrder(
            legacyOrder ? JSON.parse(legacyOrder) : allColumnNames,
            allColumnNames
        );
        // The legacy hidden lists in the wild are where BL-16569's pain lived: they can
        // name moderator-/login-gated columns the user never chose to hide (gating and
        // defaults shifted across releases, and a stale list re-asserted itself forever).
        // So the one-time migration un-hides any gated column that is default-visible; a
        // user who really wants it hidden can hide it again once. Layouts saved in the NEW
        // format only ever hide a gated column by deliberate choice, so this cleansing is
        // not needed (and not applied) anywhere else.
        const gatedDefaultVisible = new Set(
            columnDefinitions
                .filter(
                    (c) =>
                        (c.moderatorOnly || c.loggedInOnly) && c.defaultVisible
                )
                .map((c) => c.name)
        );
        const hidden = dropUnknownColumns(
            legacyHidden ? JSON.parse(legacyHidden) : defaultHidden,
            allColumnNames
        ).filter((name) => !gatedDefaultVisible.has(name));
        const encoded = encodeVisibleOrder(order, hidden, columnDefinitions);
        // undefined = the legacy layout was just the factory default: nothing to keep.
        if (encoded !== undefined)
            window.localStorage.setItem(savedKey("cols"), encoded);
        return encoded;
    };
    // Read once per mount.
    const [savedAtMount] = useState<{
        cols?: string;
        sort?: string;
        widths?: string;
    }>(() => {
        try {
            const read = (param: string) =>
                window.localStorage.getItem(savedKey(param)) ?? undefined;
            return {
                cols: read("cols") ?? migrateLegacySavedLayout(),
                sort: read("sort"),
                widths: read("widths"),
            };
        } catch {
            return {};
        }
    });

    // The columns THIS user may actually see. URL sort/filter config naming a column outside this
    // set is dropped from what we expose (see the visible* memos near the return). Defaults to all.
    const availableSet = useMemo(
        () => new Set(options?.availableColumnNames ?? allColumnNames),
        [options?.availableColumnNames, allColumnNames]
    );

    // A sort is only meaningful for a column that is both real and sortable.
    const onlyValidSortings = (sortings: Sorting[] | undefined) =>
        (sortings ?? []).filter((s) => sortableNames.has(s.columnName));
    const onlyKnownFilters = (filters: GridFilter[] | undefined) => {
        const known = new Set(allColumnNames);
        return (filters ?? []).filter((f) => known.has(f.columnName));
    };

    // The single precedence pipeline: a dimension present in the given config wins (usually
    // parsed from the real URL; at mount on a bare URL it's the personal saved view parsed as
    // if it were one); otherwise the seeded initialFilters (filters only) or the
    // column-definition defaults. Both the mount initializers and the popstate handler go
    // through here so the two can't drift apart.
    const buildStateFromConfig = (
        cfg: IGridConfigFromUrl,
        fallbacks: {
            initialFilters: GridFilter[] | undefined;
        }
    ) => ({
        sortings: onlyValidSortings(cfg.sortings),
        filters: onlyKnownFilters(cfg.filters ?? fallbacks.initialFilters),
        order: reconcileColumnOrder(
            cfg.order ?? allColumnNames,
            allColumnNames
        ),
        hidden: dropUnknownColumns(cfg.hidden ?? defaultHidden, allColumnNames),
        widths: mergeColumnWidths(allColumnNames, cfg.widths),
    });

    // Parse the URL exactly once (mount). Reads of window.location here are intentional: the
    // URL, not props, is the initial source of truth. A completely BARE url falls back to the
    // personal saved view (see above), by re-parsing AS IF the saved params were the query
    // string -- the same parser, so the two sources cannot diverge. Filters can never appear
    // in the synthetic string, so the initialFilters fallback is unaffected. (Memo deps are
    // stable -> effectively mount-only; the result is consumed by the useState initializers
    // below and the one-time backfill effect.)
    const { initial, urlWasBare } = useMemo(() => {
        let cfg = parseGridConfigFromSearch(
            window.location.search,
            columnDefinitions
        );
        const bare = !(
            cfg.sortings?.length ||
            cfg.filters?.length ||
            cfg.order ||
            cfg.widths?.length
        );
        if (bare) {
            const params = new URLSearchParams();
            if (savedAtMount.cols !== undefined)
                params.set("cols", savedAtMount.cols);
            if (savedAtMount.sort !== undefined)
                params.set("sort", savedAtMount.sort);
            if (savedAtMount.widths !== undefined)
                params.set("widths", savedAtMount.widths);
            const synthetic = params.toString();
            if (synthetic)
                cfg = parseGridConfigFromSearch(
                    "?" + synthetic,
                    columnDefinitions
                );
        }
        return { initial: cfg, urlWasBare: bare };
    }, [columnDefinitions, savedAtMount]);
    const initialState = useMemo(
        () =>
            buildStateFromConfig(initial, {
                initialFilters: options?.initialFilters,
            }),
        // Mount snapshot only (mirrors `initial`); later prop changes flow through
        // the setters and popstate, not this one-time seed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [initial]
    );

    const [sortings, setSortingsState] = useState<Sorting[]>(
        initialState.sortings
    );
    const [gridFilters, setFiltersState] = useState<GridFilter[]>(
        initialState.filters
    );
    // order + hidden come together from the URL's `cols` (visible-in-order); on a bare URL the
    // personal saved view was merged into `initial`; otherwise the factory defaults apply.
    const [columnNamesInDisplayOrder, setOrderState] = useState<string[]>(
        initialState.order
    );
    const [hiddenColumnNames, setHiddenState] = useState<string[]>(
        initialState.hidden
    );
    const [columnWidths, setWidthsState] = useState<IColumnWidth[]>(
        initialState.widths
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
        // sort/cols/widths and any unrelated params alone.
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
    // Each write* helper mirrors one dimension to the address bar AND remembers it as the
    // personal saved view (an encoder returning undefined = factory default = param removed
    // and nothing to remember). writeFilters above deliberately has no saved counterpart.

    // `cols` carries visibility + order together (see gridUrlConfig). Both setColumns and
    // setHidden funnel through here. encodeVisibleOrder returns undefined when the view matches
    // the factory default, so writeParam then removes `cols` and the URL stays clean.
    const writeVisibleOrder = (order: string[], hidden: string[]) => {
        const encoded = encodeVisibleOrder(order, hidden, columnDefinitions);
        writeParam("cols", encoded);
        writeSaved("cols", encoded);
    };
    const writeSort = (next: Sorting[]) => {
        const encoded = encodeSortings(
            next.map((s) => ({ ...s, columnName: toKey(s.columnName) }))
        );
        writeParam("sort", encoded);
        writeSaved("sort", encoded);
    };
    const writeWidths = (next: IColumnWidth[]) => {
        // encodeWidths keeps only resized columns; all-auto => param/saved removed.
        const encoded = encodeWidths(
            next.map((w) => ({ ...w, columnName: toKey(w.columnName) }))
        );
        writeParam("widths", encoded);
        writeSaved("widths", encoded);
    };

    // --- back/forward (and manual URL edits): re-read the URL into local state ---

    // Keep the latest fallbacks in a ref so the popstate listener doesn't need to re-bind.
    const fallbackRef = useRef({
        initialFilters: options?.initialFilters,
    });
    fallbackRef.current = {
        initialFilters: options?.initialFilters,
    };
    useEffect(() => {
        const onPop = () => {
            const cfg = parseGridConfigFromSearch(
                window.location.search,
                columnDefinitions
            );
            // Same precedence as the mount seed (URL wins; else seeded filters/defaults). The
            // personal saved view is deliberately NOT consulted here: it acts only at mount,
            // and the mount backfill writes it into our own history entries anyway.
            const next = buildStateFromConfig(cfg, fallbackRef.current);
            setSortingsState(next.sortings);
            setFiltersState(next.filters);
            setOrderState(next.order);
            setHiddenState(next.hidden);
            setWidthsState(next.widths);
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnDefinitions, allColumnNames, sortableNames]);

    // On a BARE url (no grid params at all), mirror the view we actually seeded into the URL on
    // mount -- the personal saved view (each write* is a no-op at its factory default) and any
    // seeded filters (e.g. bulk-edit's initialFilters) -- so the view the user sees is the view
    // a copied/bookmarked link reproduces, and the URL is once again the only source of truth
    // from here on. A URL that already carries any grid param is treated as explicit/shared and
    // left untouched -- we never inject one viewer's saved view into someone else's link.
    const didBackfillRef = useRef(false);
    useEffect(() => {
        if (didBackfillRef.current) return;
        didBackfillRef.current = true;
        if (!urlWasBare) return;
        if (gridFilters.length) writeFilters(gridFilters);
        writeVisibleOrder(columnNamesInDisplayOrder, hiddenColumnNames);
        writeSort(sortings);
        writeWidths(columnWidths);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // What we hand to the grid/query excludes any sort/filter on a column this user can't see
    // (e.g. a moderator-only column named by a shared link). The raw state keeps the full config,
    // so if the user's available set later widens (auth resolves) the entry re-appears. Column
    // order/hidden/widths already span every definition and stay unfiltered (as before).
    const visibleSortings = useMemo(
        () => sortings.filter((s) => availableSet.has(s.columnName)),
        [sortings, availableSet]
    );
    const visibleGridFilters = useMemo(
        () => gridFilters.filter((f) => availableSet.has(f.columnName)),
        [gridFilters, availableSet]
    );

    return {
        sortings: visibleSortings,
        setSortings: (next: Sorting[]) => {
            // `next` only ever covers columns this user can see (the grid never renders the
            // others). Merge back any sort on a not-currently-available column so raw state and
            // the URL keep the full config -- otherwise a moderator who edits a sort during the
            // brief auth-loading window (or on a shared link) would silently lose a sort on a
            // moderator-only column. Available and unavailable columns are disjoint, so no dupes.
            const preserved = sortings.filter(
                (s) => !availableSet.has(s.columnName)
            );
            const merged = [...next, ...preserved];
            setSortingsState(merged);
            writeSort(merged);
        },
        gridFilters: visibleGridFilters,
        setGridFilters: (next: GridFilter[]) => {
            // Same merge as setSortings: keep filters on columns outside the user's available set
            // (e.g. during auth loading, or a shared link's moderator-only filter) so they aren't
            // dropped from state/URL when the user edits a visible filter. (Filter order doesn't
            // matter to CombineGridAndSearchBoxFilter.)
            const preserved = gridFilters.filter(
                (f) => !availableSet.has(f.columnName)
            );
            const merged = [...next, ...preserved];
            // Local state first (snappy, focused typing); replaceState mirror second (no
            // re-render, so the focused input is never disturbed).
            setFiltersState(merged);
            writeFilters(merged);
        },
        columnNamesInDisplayOrder,
        setColumnNamesInDisplayOrder: (next: string[]) => {
            setOrderState(next);
            // `cols` encodes visible-columns-in-order, so it depends on the current hidden set.
            writeVisibleOrder(next, hiddenColumnNames);
        },
        hiddenColumnNames,
        setHiddenColumnNames: (next: string[]) => {
            setHiddenState(next);
            writeVisibleOrder(columnNamesInDisplayOrder, next);
        },
        columnWidths,
        setColumnWidths: (next: IColumnWidth[]) => {
            setWidthsState(next);
            writeWidths(next);
        },
        resetView: () => {
            // Set every view dimension to its factory default; the write* helpers then remove
            // the URL params AND the saved-view entries (every encoder returns undefined at
            // the default), so future bare visits are factory-default too. Filters are left
            // alone: they're visible/clearable in the filter row and never persisted.
            const order = [...allColumnNames];
            const hidden = [...defaultHidden];
            const widths = mergeColumnWidths(allColumnNames, undefined);
            setOrderState(order);
            setHiddenState(hidden);
            setSortingsState([]);
            setWidthsState(widths);
            writeVisibleOrder(order, hidden);
            writeSort([]);
            writeWidths(widths);
        },
    };
}
