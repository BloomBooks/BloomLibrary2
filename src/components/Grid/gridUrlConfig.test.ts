import { Sorting } from "@devexpress/dx-react-grid";
import { IGridColumn } from "./GridColumns";
import {
    encodeSortings,
    decodeSortings,
    encodeStringArray,
    decodeStringArray,
    encodeWidths,
    decodeWidths,
    urlKeyForColumn,
    nameToUrlKeyMap,
    urlKeyToNameMap,
    findUrlKeyProblems,
    parseGridConfigFromSearch,
    reconcileColumnOrder,
    dropUnknownColumns,
    mergeColumnWidths,
    encodeVisibleOrder,
    decodeVisibleOrder,
    IColumnWidth,
} from "./gridUrlConfig";

// "title" gets a urlKey to avoid colliding with the app's existing "title" search param.
// title/incoming are visible by default; level is hidden by default.
const columns: IGridColumn[] = [
    {
        name: "title",
        title: "Title",
        urlKey: "ti",
        defaultVisible: true,
        sortingEnabled: true,
    },
    { name: "incoming", title: "Incoming", urlKey: "in", defaultVisible: true },
    { name: "level", title: "Level", urlKey: "lv", sortingEnabled: true },
];

describe("sortings encode/decode (operate on whatever token is given)", () => {
    it("round-trips a multi-column sort", () => {
        const sortings: Sorting[] = [
            { columnName: "ti", direction: "asc" },
            { columnName: "lv", direction: "desc" },
        ];
        expect(encodeSortings(sortings)).toBe("ti:asc,lv:desc");
        expect(decodeSortings("ti:asc,lv:desc")).toEqual(sortings);
    });
    it("empty/absent => undefined; '' => []", () => {
        expect(encodeSortings([])).toBeUndefined();
        expect(decodeSortings(undefined)).toBeUndefined();
        expect(decodeSortings("")).toEqual([]);
    });
    it("defaults a missing/garbled direction to asc", () => {
        expect(decodeSortings("ti")).toEqual([
            { columnName: "ti", direction: "asc" },
        ]);
        expect(decodeSortings("ti:sideways")).toEqual([
            { columnName: "ti", direction: "asc" },
        ]);
    });
    it("de-dupes repeated columns (keep last)", () => {
        expect(decodeSortings("ti:asc,ti:desc")).toEqual([
            { columnName: "ti", direction: "desc" },
        ]);
    });
});

describe("string array (cols/hidden) encode/decode", () => {
    it("round-trips a list; '' => [], absent => undefined", () => {
        expect(encodeStringArray(["ti", "lv"])).toBe("ti,lv");
        expect(decodeStringArray("ti,lv")).toEqual(["ti", "lv"]);
        expect(encodeStringArray([])).toBe("");
        expect(decodeStringArray("")).toEqual([]);
        expect(decodeStringArray(undefined)).toBeUndefined();
    });
});

describe("widths encode/decode (reject non-positive / non-integer)", () => {
    it("round-trips only resized integer widths", () => {
        const widths: IColumnWidth[] = [
            { columnName: "ti", width: 200 },
            { columnName: "in", width: "auto" },
            { columnName: "lv", width: 120 },
        ];
        expect(encodeWidths(widths)).toBe("ti:200,lv:120");
        expect(decodeWidths("ti:200,lv:120")).toEqual([
            { columnName: "ti", width: 200 },
            { columnName: "lv", width: 120 },
        ]);
    });
    it("rejects empty, zero, negative, hex, and non-numeric widths", () => {
        expect(decodeWidths("ti:")).toEqual([]);
        expect(decodeWidths("ti:0")).toEqual([]);
        expect(decodeWidths("ti:-50")).toEqual([]);
        expect(decodeWidths("ti:0x10")).toEqual([]);
        expect(decodeWidths("ti:abc,lv:150")).toEqual([
            { columnName: "lv", width: 150 },
        ]);
    });
    it("de-dupes repeated columns (keep last)", () => {
        expect(decodeWidths("ti:10,ti:20")).toEqual([
            { columnName: "ti", width: 20 },
        ]);
    });
    it("encodes all-auto as undefined", () => {
        expect(
            encodeWidths([{ columnName: "ti", width: "auto" }])
        ).toBeUndefined();
    });

    it("rounds sub-pixel widths to whole pixels (and so they round-trip)", () => {
        const encoded = encodeWidths([
            { columnName: "lc", width: 252.85833740234375 },
            { columnName: "lg", width: 188.4 },
        ]);
        expect(encoded).toBe("lc:253,lg:188");
        expect(decodeWidths(encoded)).toEqual([
            { columnName: "lc", width: 253 },
            { columnName: "lg", width: 188 },
        ]);
    });
});

describe("urlKey maps and validation", () => {
    it("urlKeyForColumn falls back to name", () => {
        expect(urlKeyForColumn(columns[0])).toBe("ti");
        expect(urlKeyForColumn({ name: "plain" })).toBe("plain");
    });
    it("builds name<->key maps both ways", () => {
        expect(nameToUrlKeyMap(columns).get("title")).toBe("ti");
        expect(urlKeyToNameMap(columns).get("lv")).toBe("level");
    });
    it("findUrlKeyProblems flags duplicates and reserved keys", () => {
        expect(findUrlKeyProblems(columns)).toEqual([]);
        const dup: IGridColumn[] = [
            { name: "a", urlKey: "x" },
            { name: "b", urlKey: "x" },
            { name: "c", urlKey: "sort" },
        ];
        const problems = findUrlKeyProblems(dup);
        expect(problems.some((p) => p.includes("duplicated"))).toBe(true);
        expect(problems.some((p) => p.includes("reserved"))).toBe(true);
    });
});

describe("parseGridConfigFromSearch (URL keys -> internal names)", () => {
    it("reads readable per-column filters keyed by urlKey", () => {
        const cfg = parseGridConfigFromSearch("?in=true&lv=4&ti=math", columns);
        expect(cfg.filters).toEqual([
            { columnName: "title", operation: "contains", value: "math" },
            { columnName: "incoming", operation: "contains", value: "true" },
            { columnName: "level", operation: "contains", value: "4" },
        ]);
    });
    it("does NOT treat the reserved 'title' param as the title filter", () => {
        expect(
            parseGridConfigFromSearch("?title=search", columns).filters
        ).toBeUndefined();
    });
    it("maps sort/cols/widths keys back to names, dropping unknowns", () => {
        const cfg = parseGridConfigFromSearch(
            "?sort=lv:desc&cols=lv,xx,ti,in&widths=lv:90",
            columns
        );
        expect(cfg.sortings).toEqual([
            { columnName: "level", direction: "desc" },
        ]);
        // cols lists the visible columns in order (xx dropped); all three become visible.
        expect(cfg.order).toEqual(["level", "title", "incoming"]);
        expect(cfg.hidden).toEqual([]);
        expect(cfg.widths).toEqual([{ columnName: "level", width: 90 }]);
    });
    it("treats a bare/empty filter key as no filter (undefined, not []), so a caller's initialFilters aren't clobbered", () => {
        // A hand-edited/stale link like ?ti= must NOT flip filters to [] (which would suppress
        // a fallback); it should read as "no filter present at all".
        expect(
            parseGridConfigFromSearch("?ti=", columns).filters
        ).toBeUndefined();
        // A real value elsewhere still yields only that filter; the empty key is ignored.
        expect(
            parseGridConfigFromSearch("?ti=&lv=4", columns).filters
        ).toEqual([{ columnName: "level", operation: "contains", value: "4" }]);
    });
    it("returns filters undefined when no filter params are present", () => {
        expect(
            parseGridConfigFromSearch("?sort=ti:asc", columns).filters
        ).toBeUndefined();
    });
});

describe("visible-order encode/decode (cols carries visibility + order)", () => {
    // factory: visible = [title, incoming] (in order); hidden = [level]
    const DEFAULT_ORDER = ["title", "incoming", "level"];

    it("encodes the visible columns in order; omits when it matches the factory default", () => {
        // default view -> undefined (bare URL)
        expect(
            encodeVisibleOrder(DEFAULT_ORDER, ["level"], columns)
        ).toBeUndefined();
        // reveal level -> ti,in,lv
        expect(encodeVisibleOrder(DEFAULT_ORDER, [], columns)).toBe("ti,in,lv");
        // hide title -> in
        expect(
            encodeVisibleOrder(DEFAULT_ORDER, ["title", "level"], columns)
        ).toBe("in");
        // reorder visible columns -> in,ti
        expect(
            encodeVisibleOrder(
                ["incoming", "title", "level"],
                ["level"],
                columns
            )
        ).toBe("in,ti");
    });

    it("decodes to a full order + hidden set; unlisted columns are hidden", () => {
        expect(decodeVisibleOrder("ti,in,lv", columns)).toEqual({
            order: ["title", "incoming", "level"],
            hidden: [],
        });
        // only incoming visible; title/level hidden, kept at factory positions
        expect(decodeVisibleOrder("in", columns)).toEqual({
            order: ["title", "incoming", "level"],
            hidden: ["title", "level"],
        });
        // reordered + unknown key dropped + dedupe
        expect(decodeVisibleOrder("lv,xx,ti,ti", columns)).toEqual({
            order: ["level", "incoming", "title"],
            hidden: ["incoming"],
        });
        // "" => everything hidden; absent => undefined (fall back)
        expect(decodeVisibleOrder("", columns)).toEqual({
            order: ["title", "incoming", "level"],
            hidden: ["title", "incoming", "level"],
        });
        expect(decodeVisibleOrder(undefined, columns)).toBeUndefined();
    });

    it("round-trips (encode -> decode preserves the visible view)", () => {
        const encoded = encodeVisibleOrder(
            ["incoming", "title", "level"],
            ["level"],
            columns
        );
        const decoded = decodeVisibleOrder(encoded, columns)!;
        const visible = decoded.order.filter(
            (n) => !decoded.hidden.includes(n)
        );
        expect(visible).toEqual(["incoming", "title"]);
    });
});

describe("reconcile / dropUnknown / mergeColumnWidths", () => {
    const all = ["a", "b", "c", "d"];
    it("appends columns missing from a stale order; drops removed ones", () => {
        expect(reconcileColumnOrder(["a", "b", "c"], all)).toEqual([
            "a",
            "b",
            "c",
            "d",
        ]);
        expect(reconcileColumnOrder(["b", "x", "a"], all)).toEqual([
            "b",
            "a",
            "c",
            "d",
        ]);
    });
    it("dropUnknownColumns removes unknown names", () => {
        expect(dropUnknownColumns(["a", "gone"], all)).toEqual(["a"]);
    });
    it("mergeColumnWidths gives every column a width, defaulting to auto", () => {
        expect(
            mergeColumnWidths(
                ["a", "b", "c"],
                [{ columnName: "b", width: 150 }]
            )
        ).toEqual([
            { columnName: "a", width: "auto" },
            { columnName: "b", width: 150 },
            { columnName: "c", width: "auto" },
        ]);
    });
});
