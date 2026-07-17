// Pure (no-React) serialization of grid configuration to/from the URL query string.
//
// Each grid screen (book, language, country, uploader) lets the user sort, filter,
// show/hide columns, reorder columns, and resize columns. We keep that configuration in
// the URL so a view can be bookmarked or shared. useGridConfigInUrl.ts wires this to React
// state and the address bar; it also remembers the user's cols/sort/widths values in
// localStorage (the "personal saved view") using these same encodings.
//
// URL scheme (each grid is on its own route, so these don't collide between grids, nor with
// the book grid's path :search segment or the start/end date params):
//   sort     sort model            one param, comma list "name:asc|desc"
//   cols     the VISIBLE columns, in display order — a single param that carries BOTH which
//            columns are shown and their order: listed = shown, unlisted = hidden. e.g.
//            ?cols=ti,lg,lc . Omitted when the view matches the factory default.
//   widths   resized column widths  one param, comma list "name:px" (only resized columns)
//   <col>    a per-column filter    one param PER filtered column, keyed by the column's
//                                   urlKey (falls back to its name), e.g. ?incoming=true&level=4
//
// Column names appear only as *values* inside sort/cols/widths, so they can't collide with
// other query params. A filter, by contrast, uses the column's key as the param *name*, which
// can collide (e.g. a "title" column vs. this app's existing "title" search param), so a column
// may define a short, collision-free `urlKey`.
//
// Visibility + order are encoded together (the single `cols` list) rather than as a separate
// "which columns are hidden" delta. That keeps each column out of the URL twice, avoids the
// long hidden-list "goop" in grids that hide most columns by default, lists only the handful of
// VISIBLE columns, and is stable if the factory defaults later change (an old link reproduces
// exactly the columns it names; columns added later simply aren't in it).

import { Filter as GridFilter, Sorting } from "@devexpress/dx-react-grid";
import { IGridColumn } from "./GridColumns";

// DevExpress represents a (possibly "auto") column width as this shape.
export interface IColumnWidth {
    columnName: string;
    width: number | string;
}

// The single-value params the grid owns. Per-column filter params are added on top.
export const RESERVED_GRID_PARAM_KEYS = ["sort", "cols", "widths"];

type Maybe = string | null | undefined;

// ---------------------------------------------------------------------------
// sort  (one param: "name:asc,other:desc")
// ---------------------------------------------------------------------------

export function encodeSortings(
    sortings: ReadonlyArray<Sorting> | null | undefined
): string | undefined {
    if (!sortings || sortings.length === 0) return undefined;
    return sortings
        .map(
            (s) => `${s.columnName}:${s.direction === "desc" ? "desc" : "asc"}`
        )
        .join(",");
}

export function decodeSortings(value: Maybe): Sorting[] | undefined {
    if (value === null || value === undefined) return undefined;
    if (value === "") return [];
    const parsed = value
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0)
        .map((token) => {
            const idx = token.lastIndexOf(":");
            const columnName = idx === -1 ? token : token.slice(0, idx);
            const dir = idx === -1 ? "" : token.slice(idx + 1);
            return {
                columnName,
                direction: dir === "desc" ? "desc" : "asc",
            } as Sorting;
        })
        .filter((s) => s.columnName.length > 0);
    return dedupeByColumn(parsed);
}

// ---------------------------------------------------------------------------
// string lists: cols  (one param: "a,b,c")
// ---------------------------------------------------------------------------

export function encodeStringArray(
    arr: ReadonlyArray<string> | null | undefined
): string | undefined {
    if (arr === null || arr === undefined) return undefined;
    // An empty array is meaningful (e.g. "nothing hidden"); encode it as "".
    return arr.join(",");
}

export function decodeStringArray(value: Maybe): string[] | undefined {
    if (value === null || value === undefined) return undefined;
    if (value === "") return [];
    return value.split(",").filter((x) => x.length > 0);
}

// ---------------------------------------------------------------------------
// column widths  (one param: "title:200,date:120")
// ---------------------------------------------------------------------------

export function encodeWidths(
    widths: ReadonlyArray<IColumnWidth> | null | undefined
): string | undefined {
    if (!widths) return undefined;
    const resized = widths.filter(
        (w) => typeof w.width === "number" && isFinite(w.width as number)
    );
    if (resized.length === 0) return undefined;
    // DevExpress reports sub-pixel widths (e.g. 252.858...). Round to whole pixels: it keeps
    // the URL sane and matches decodeWidths, which only accepts integers (so an un-rounded
    // value would be silently dropped on reload).
    return resized
        .map((w) => `${w.columnName}:${Math.round(w.width as number)}`)
        .join(",");
}

export function decodeWidths(value: Maybe): IColumnWidth[] | undefined {
    if (value === null || value === undefined) return undefined;
    if (value === "") return [];
    const result: IColumnWidth[] = [];
    for (const token of value.split(",")) {
        const idx = token.lastIndexOf(":");
        if (idx === -1) continue;
        const columnName = token.slice(0, idx);
        const raw = token.slice(idx + 1);
        // Only accept a plain positive integer; this rejects "", "0", negatives,
        // hex ("0x10"), and NaN, any of which would collapse/break a column from a
        // stale or hand-edited URL.
        if (!columnName || !/^\d+$/.test(raw)) continue;
        const width = Number(raw);
        if (width <= 0) continue;
        result.push({ columnName, width });
    }
    return dedupeByColumn(result);
}

// Keep the last entry per columnName (a hand-edited URL could repeat a column).
function dedupeByColumn<T extends { columnName: string }>(items: T[]): T[] {
    const byColumn = new Map<string, T>();
    for (const item of items) byColumn.set(item.columnName, item);
    return [...byColumn.values()];
}

// ---------------------------------------------------------------------------
// per-column filter param keys
// ---------------------------------------------------------------------------

// The query-param identifier for a column: its short `urlKey` if set, otherwise its name.
// Used both as a filter's param NAME and as the column's token inside sort/cols/widths,
// so the whole URL reads in the same compact terms (e.g. ?in=true&sort=ti:desc&cols=ti,lg).
export function urlKeyForColumn(column: IGridColumn): string {
    return column.urlKey ?? column.name;
}

// Stamp each column definition with its short URL key from a per-grid `{name: urlKey}` map,
// leaving any key the map doesn't mention at whatever `urlKey` the definition already had.
// The country/language/uploader grids end getXGridColumnsDefinitions() with this; the book grid
// applies the same `map[name] ?? urlKey` merge inline (it also titleCases/sorts in one pass).
export function applyUrlKeys(
    definitions: IGridColumn[],
    urlKeysByName: { [name: string]: string }
): IGridColumn[] {
    return definitions.map((c) => ({
        ...c,
        urlKey: urlKeysByName[c.name] ?? c.urlKey,
    }));
}

export function nameToUrlKeyMap(
    columnDefinitions: ReadonlyArray<IGridColumn>
): Map<string, string> {
    return new Map(columnDefinitions.map((c) => [c.name, urlKeyForColumn(c)]));
}

export function urlKeyToNameMap(
    columnDefinitions: ReadonlyArray<IGridColumn>
): Map<string, string> {
    return new Map(columnDefinitions.map((c) => [urlKeyForColumn(c), c.name]));
}

// Dev-time guard: every column's urlKey must be unique within a grid and must not shadow a
// reserved param. Returns the offending keys (empty if all good) so a test/assert can report.
export function findUrlKeyProblems(
    columnDefinitions: ReadonlyArray<IGridColumn>
): string[] {
    const reserved = new Set(RESERVED_GRID_PARAM_KEYS);
    const seen = new Set<string>();
    const problems: string[] = [];
    for (const column of columnDefinitions) {
        const key = urlKeyForColumn(column);
        if (reserved.has(key))
            problems.push(`${column.name}: urlKey "${key}" is reserved`);
        if (seen.has(key))
            problems.push(`${column.name}: urlKey "${key}" is duplicated`);
        seen.add(key);
    }
    return problems;
}

// ---------------------------------------------------------------------------
// reconciliation / validation helpers
// ---------------------------------------------------------------------------

// Turn a candidate column order (from the URL, the personal saved view in localStorage, or a
// legacy saved layout -- any of which may be stale) into a
// complete, valid order: keep known names in their given order, drop names that are no
// longer real columns, and append any columns missing from the candidate (e.g. a column
// added in a newer release) at the end in their default order.
export function reconcileColumnOrder(
    candidate: ReadonlyArray<string> | null | undefined,
    allColumnNamesInDefaultOrder: ReadonlyArray<string>
): string[] {
    const valid = new Set(allColumnNamesInDefaultOrder);
    const kept = (candidate || []).filter((name) => valid.has(name));
    const present = new Set(kept);
    const appended = allColumnNamesInDefaultOrder.filter(
        (name) => !present.has(name)
    );
    return [...kept, ...appended];
}

// Drop any names that aren't real columns (e.g. a column removed since the URL was made).
export function dropUnknownColumns(
    names: ReadonlyArray<string> | null | undefined,
    allColumnNames: ReadonlyArray<string>
): string[] {
    const valid = new Set(allColumnNames);
    return (names || []).filter((name) => valid.has(name));
}

function arraysEqual(
    a: ReadonlyArray<string>,
    b: ReadonlyArray<string>
): boolean {
    return a.length === b.length && a.every((x, i) => x === b[i]);
}

// Encode the VISIBLE columns, in display order, as the `cols` value (urlKeys). This single
// value carries both visibility (listed = shown) and order. Returns undefined when the visible
// set+order already equals the factory default, so a default view keeps the URL bare. Hidden
// columns are simply omitted; decodeVisibleOrder slots them back at their factory positions.
export function encodeVisibleOrder(
    columnNamesInDisplayOrder: ReadonlyArray<string>,
    hiddenColumnNames: ReadonlyArray<string>,
    columnDefinitions: ReadonlyArray<IGridColumn>
): string | undefined {
    const hidden = new Set(hiddenColumnNames);
    const visibleInOrder = columnNamesInDisplayOrder.filter(
        (n) => !hidden.has(n)
    );
    const factoryVisibleInOrder = columnDefinitions
        .filter((c) => c.defaultVisible)
        .map((c) => c.name);
    if (arraysEqual(visibleInOrder, factoryVisibleInOrder)) return undefined;
    const toKey = nameToUrlKeyMap(columnDefinitions);
    return encodeStringArray(visibleInOrder.map((n) => toKey.get(n) ?? n));
}

// Inverse of encodeVisibleOrder. From the `cols` value, produce the full column order (the
// visible columns in the given order, slotted into their factory positions; hidden columns
// keep their factory slots) and the hidden set (every column not listed). Returns undefined
// when `cols` is absent (caller falls back to the personal saved view in localStorage, or
// the column-definition defaults).
export function decodeVisibleOrder(
    value: Maybe,
    columnDefinitions: ReadonlyArray<IGridColumn>
): { order: string[]; hidden: string[] } | undefined {
    const decoded = decodeStringArray(value);
    if (decoded === undefined) return undefined;
    const keyToName = urlKeyToNameMap(columnDefinitions);
    const factoryOrder = columnDefinitions.map((c) => c.name);
    // urlKeys -> names, drop unknown, de-dupe (a stale/hand-edited url could repeat)
    const visibleSet = new Set<string>();
    const visible: string[] = [];
    for (const key of decoded) {
        const name = keyToName.get(key);
        if (name !== undefined && !visibleSet.has(name)) {
            visibleSet.add(name);
            visible.push(name);
        }
    }
    // Place the visible columns (in their given order) into the factory slots that are visible;
    // keep hidden columns at their factory positions so a later reveal lands somewhere sensible.
    const queue = [...visible];
    const order = factoryOrder.map((name) =>
        visibleSet.has(name) ? queue.shift()! : name
    );
    const hidden = factoryOrder.filter((name) => !visibleSet.has(name));
    return { order, hidden };
}

// Produce the full controlled width list the grid expects: every column gets a width,
// defaulting to "auto" unless a resized numeric width was supplied for it.
export function mergeColumnWidths(
    allColumnNamesInDefaultOrder: ReadonlyArray<string>,
    resized: ReadonlyArray<IColumnWidth> | null | undefined
): IColumnWidth[] {
    const byName = new Map<string, number | string>();
    (resized || []).forEach((w) => byName.set(w.columnName, w.width));
    return allColumnNamesInDefaultOrder.map((name) => ({
        columnName: name,
        width: byName.has(name) ? byName.get(name)! : "auto",
    }));
}

// ---------------------------------------------------------------------------
// whole-config parse / build against a search string
// ---------------------------------------------------------------------------

export interface IGridConfigFromUrl {
    // All columnNames below are the grid's internal names (mapped back from URL keys).
    sortings?: Sorting[];
    filters?: GridFilter[]; // undefined => no filter params present at all
    // order + hidden are derived together from the single `cols` param (visible-in-order).
    // Both undefined when `cols` is absent (caller falls back to the personal saved view
    // in localStorage, or the column-definition defaults).
    order?: string[]; // full column order (all columns)
    hidden?: string[];
    widths?: IColumnWidth[];
}

// Parse the grid's config out of a search string. The URL speaks in short urlKeys; everything
// returned here is mapped back to the grid's internal column NAMES (unknown keys dropped). The
// hook owns WRITING the URL (incrementally, per dimension) -- see useGridConfigInUrl.
export function parseGridConfigFromSearch(
    search: string,
    columnDefinitions: ReadonlyArray<IGridColumn>
): IGridConfigFromUrl {
    const params = new URLSearchParams(search);
    const reserved = new Set(RESERVED_GRID_PARAM_KEYS);
    const keyToName = urlKeyToNameMap(columnDefinitions);
    const toName = (key: string) => keyToName.get(key);

    let sawFilterKey = false;
    const filters: GridFilter[] = [];
    for (const column of columnDefinitions) {
        const key = urlKeyForColumn(column);
        if (reserved.has(key)) continue; // never let a column shadow sort/cols/widths
        if (!params.has(key)) continue;
        const value = params.get(key);
        // Only an actual (non-empty) value counts as "a filter is present". A bare `?ti=`
        // (hand-edited/stale link) contributes no filter and must NOT flip filters from
        // `undefined` to `[]`, or it would suppress the caller's initialFilters fallback.
        if (value !== null && value !== "") {
            sawFilterKey = true;
            filters.push({
                columnName: column.name,
                operation: "contains",
                value,
            });
        }
    }

    // map sort/widths tokens (urlKeys) back to internal names, dropping unknowns. toName may
    // return undefined for an unknown key, so narrow with a type-guard rather than `!`.
    const sortings = decodeSortings(params.get("sort"))
        ?.map((s) => ({ ...s, columnName: toName(s.columnName) }))
        .filter((s): s is Sorting => s.columnName !== undefined);
    const widths = decodeWidths(params.get("widths"))
        ?.map((w) => ({ ...w, columnName: toName(w.columnName) }))
        .filter((w): w is IColumnWidth => w.columnName !== undefined);

    // `cols` (visible columns in order) yields both the full order and the hidden set.
    const visibility = decodeVisibleOrder(
        params.get("cols"),
        columnDefinitions
    );

    return {
        sortings,
        filters: sawFilterKey ? filters : undefined,
        order: visibility?.order,
        hidden: visibility?.hidden,
        widths,
    };
}
