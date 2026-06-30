// Integration test for useGridConfigInUrl. The hook reads window.location on mount, mirrors
// changes to the address bar with history.replaceState, and re-reads on popstate -- no router
// or provider involved -- so we drive it here with the real jsdom window history. This stands
// in for the live-browser check, since the grid screens themselves are behind a login gate.

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { useGridConfigInUrl, IGridConfigInUrl } from "./useGridConfigInUrl";
import { IGridColumn } from "./GridColumns";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";

// Short urlKeys mirror the real scheme. "Is Rebrand" (a real book column whose NAME has a
// space) is included to prove the space lives only in the name, never in the URL (key "rb").
const columns: IGridColumn[] = [
    {
        name: "title",
        title: "Title",
        urlKey: "ti",
        defaultVisible: true,
        sortingEnabled: true,
    },
    { name: "incoming", title: "Incoming", urlKey: "in", defaultVisible: true },
    {
        name: "level",
        title: "Level",
        urlKey: "lv",
        defaultVisible: false,
        sortingEnabled: true,
    },
    {
        name: "Is Rebrand",
        title: "Is Rebrand",
        urlKey: "rb",
        defaultVisible: false,
    },
];
const DEFAULT_ORDER = ["title", "incoming", "level", "Is Rebrand"];
const DEFAULT_HIDDEN = ["level", "Is Rebrand"];

let api: IGridConfigInUrl;
let harnessOptions: { initialFilters?: GridFilter[] } | undefined;
function Harness() {
    api = useGridConfigInUrl(columns, "test-grid", harnessOptions);
    return null;
}

let container: HTMLDivElement;
function mount() {
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
        ReactDOM.render(<Harness />, container);
    });
}
function unmount() {
    act(() => {
        ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
}
function search() {
    return decodeURIComponent(window.location.search);
}
function param(key: string) {
    return new URLSearchParams(window.location.search).get(key);
}

beforeEach(() => {
    localStorage.clear();
    harnessOptions = undefined;
    window.history.replaceState(null, "", "/grid/books");
});
afterEach(() => {
    if (container && container.parentNode) unmount();
});

describe("writing config to the URL (readable, abbreviated keys)", () => {
    it("starts with defaults and a clean URL", () => {
        mount();
        expect(window.location.search).toBe("");
        expect(api.sortings).toEqual([]);
        expect(api.gridFilters).toEqual([]);
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
    });

    it("writes per-column filters keyed by the column's urlKey", () => {
        mount();
        act(() => {
            api.setGridFilters([
                {
                    columnName: "incoming",
                    operation: "contains",
                    value: "true",
                },
                { columnName: "level", operation: "contains", value: "4" },
            ]);
        });
        expect(search()).toContain("in=true");
        expect(search()).toContain("lv=4");
        expect(search()).not.toContain("[");
    });

    it("uses 'ti' for the title column (never a bare 'title' param)", () => {
        mount();
        act(() =>
            api.setGridFilters([
                { columnName: "title", operation: "contains", value: "math" },
            ])
        );
        expect(param("ti")).toBe("math");
        expect(param("title")).toBeNull();
    });

    it("maps a space-containing column name to a clean key ('Is Rebrand' -> rb)", () => {
        mount();
        act(() =>
            api.setGridFilters([
                {
                    columnName: "Is Rebrand",
                    operation: "contains",
                    value: "yes",
                },
            ])
        );
        expect(param("rb")).toBe("yes");
        expect(window.location.search).not.toContain("Rebrand");
    });

    it("keeps special characters in a filter value exact", () => {
        mount();
        act(() =>
            api.setGridFilters([
                {
                    columnName: "title",
                    operation: "contains",
                    value: 'a&b=c#d %100 +z "q"',
                },
            ])
        );
        expect(param("ti")).toBe('a&b=c#d %100 +z "q"');
    });

    it("writes sort, widths, and cols (visible columns in order); omits cols at default", () => {
        mount();
        act(() =>
            api.setSortings([{ columnName: "level", direction: "desc" }])
        );
        // reveal everything -> all four columns visible, in order
        act(() => api.setHiddenColumnNames([]));
        act(() =>
            api.setColumnWidths([
                { columnName: "title", width: 250 },
                { columnName: "incoming", width: "auto" },
                { columnName: "level", width: "auto" },
                { columnName: "Is Rebrand", width: "auto" },
            ])
        );
        expect(param("sort")).toBe("lv:desc");
        expect(param("cols")).toBe("ti,in,lv,rb"); // visible-in-order (no separate show/hide)
        expect(param("widths")).toBe("ti:250");

        // hide down to a single visible column -> cols=in
        act(() => api.setHiddenColumnNames(["title", "level", "Is Rebrand"]));
        expect(param("cols")).toBe("in");

        // reorder the visible columns -> cols reflects the new visible order
        act(() => api.setHiddenColumnNames(DEFAULT_HIDDEN)); // visible back to [title, incoming]
        act(() =>
            api.setColumnNamesInDisplayOrder([
                "incoming",
                "title",
                "level",
                "Is Rebrand",
            ])
        );
        expect(param("cols")).toBe("in,ti");

        // back to the factory default view -> cols removed (no stale shadow)
        act(() => api.setColumnNamesInDisplayOrder(DEFAULT_ORDER));
        expect(param("cols")).toBeNull();
    });

    it("writes commas and colons literally (no %2C / %3A) for readability", () => {
        mount();
        act(() =>
            api.setSortings([{ columnName: "level", direction: "desc" }])
        );
        act(() => api.setHiddenColumnNames([])); // reveal all -> cols=ti,in,lv,rb
        // raw (un-decoded) search string should be human-readable
        expect(window.location.search).toContain("sort=lv:desc");
        expect(window.location.search).toContain("cols=ti,in,lv,rb");
        expect(window.location.search).not.toContain("%2C");
        expect(window.location.search).not.toContain("%3A");
    });

    it("ignores a sort on a non-sortable column from a crafted URL", () => {
        window.history.replaceState(null, "", "/grid/books?sort=in:asc"); // incoming not sortable
        mount();
        expect(api.sortings).toEqual([]);
    });
});

describe("typing stays in step (regression for dropped characters)", () => {
    it("updates local state synchronously per keystroke and mirrors to the URL", () => {
        mount();
        for (const v of ["m", "ma", "mat", "math"]) {
            act(() =>
                api.setGridFilters([
                    { columnName: "title", operation: "contains", value: v },
                ])
            );
            expect(api.gridFilters[0].value).toBe(v);
        }
        expect(param("ti")).toBe("math");
    });
});

describe("restoring config from the URL (a shared/bookmarked link)", () => {
    it("hydrates every dimension from an abbreviated query string", () => {
        window.history.replaceState(
            null,
            "",
            "/grid/books?sort=lv:asc&cols=ti,in,lv&widths=in:180&in=true"
        );
        mount();
        expect(api.sortings).toEqual([
            { columnName: "level", direction: "asc" },
        ]);
        // cols=ti,in,lv => those three visible; Is Rebrand (not listed) hidden
        expect(api.hiddenColumnNames).toEqual(["Is Rebrand"]);
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
        expect(api.columnWidths).toEqual([
            { columnName: "title", width: "auto" },
            { columnName: "incoming", width: 180 },
            { columnName: "level", width: "auto" },
            { columnName: "Is Rebrand", width: "auto" },
        ]);
    });

    it("treats columns not listed in cols as hidden (kept at factory position)", () => {
        window.history.replaceState(null, "", "/grid/books?cols=ti,in");
        mount();
        // title+incoming visible (factory default); level & Is Rebrand hidden, at factory slots
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
    });

    it("round-trips resized widths across a remount", () => {
        mount();
        act(() =>
            api.setColumnWidths([
                { columnName: "title", width: 300 },
                { columnName: "incoming", width: "auto" },
                { columnName: "level", width: "auto" },
                { columnName: "Is Rebrand", width: "auto" },
            ])
        );
        expect(param("widths")).toBe("ti:300");
        unmount();
        mount(); // fresh component reads the URL again
        expect(
            api.columnWidths.find((w) => w.columnName === "title")!.width
        ).toBe(300);
    });
});

describe("back/forward navigation (popstate) re-reads the URL", () => {
    it("restores sort and column order on Back", () => {
        mount();
        act(() => api.setSortings([{ columnName: "title", direction: "asc" }]));
        act(() => {
            window.history.replaceState(
                null,
                "",
                "/grid/books?sort=lv:desc&cols=lv,ti,in,rb"
            );
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        expect(api.sortings).toEqual([
            { columnName: "level", direction: "desc" },
        ]);
        expect(api.columnNamesInDisplayOrder).toEqual([
            "level",
            "title",
            "incoming",
            "Is Rebrand",
        ]);
    });

    it("restores filters on Back", () => {
        mount();
        act(() =>
            api.setGridFilters([
                { columnName: "level", operation: "contains", value: "4" },
            ])
        );
        act(() => {
            window.history.replaceState(null, "", "/grid/books?in=true");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
    });
});

describe("initialFilters (e.g. bulk-edit) seeding & precedence", () => {
    it("seeds filters from initialFilters when the URL is silent", () => {
        harnessOptions = {
            initialFilters: [
                {
                    columnName: "incoming",
                    operation: "contains",
                    value: "true",
                },
            ],
        };
        mount();
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
    });

    it("lets URL filters override initialFilters", () => {
        harnessOptions = {
            initialFilters: [
                {
                    columnName: "incoming",
                    operation: "contains",
                    value: "true",
                },
            ],
        };
        window.history.replaceState(null, "", "/grid/books?lv=4");
        mount();
        expect(api.gridFilters).toEqual([
            { columnName: "level", operation: "contains", value: "4" },
        ]);
    });

    it("falls back to initialFilters (not empty) on Back to a filterless URL", () => {
        harnessOptions = {
            initialFilters: [
                {
                    columnName: "incoming",
                    operation: "contains",
                    value: "true",
                },
            ],
        };
        mount();
        act(() =>
            api.setGridFilters([
                { columnName: "level", operation: "contains", value: "4" },
            ])
        );
        act(() => {
            window.history.replaceState(null, "", "/grid/books");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
    });
});

describe("bare-URL backfill (make a localStorage layout shareable)", () => {
    it("writes the localStorage-derived view into a bare URL as compact deltas", () => {
        localStorage.setItem(
            "test-grid-column-order",
            JSON.stringify(["incoming", "title", "level", "Is Rebrand"])
        );
        localStorage.setItem(
            "test-grid-column-hidden",
            JSON.stringify(["Is Rebrand"]) // level revealed vs default
        );
        mount();
        // single cols param = the visible columns in order (incoming,title,level; Is Rebrand hidden)
        expect(param("cols")).toBe("in,ti,lv");
    });

    it("leaves a bare URL bare when the layout equals the factory default", () => {
        mount();
        expect(window.location.search).toBe("");
    });

    it("does NOT inject local layout into a URL that already has grid params (shared link)", () => {
        localStorage.setItem(
            "test-grid-column-order",
            JSON.stringify(["incoming", "title", "level", "Is Rebrand"])
        );
        window.history.replaceState(null, "", "/grid/books?ti=math");
        mount();
        // respected as-is: the shared filter stays, our local reorder is NOT added
        expect(param("ti")).toBe("math");
        expect(param("cols")).toBeNull();
    });
});

describe("localStorage precedence", () => {
    it("uses personal localStorage column prefs when the URL is silent", () => {
        localStorage.setItem(
            "test-grid-column-hidden",
            JSON.stringify(["incoming"])
        );
        localStorage.setItem(
            "test-grid-column-order",
            JSON.stringify(["incoming", "title", "level", "Is Rebrand"])
        );
        mount();
        expect(api.hiddenColumnNames).toEqual(["incoming"]);
        expect(api.columnNamesInDisplayOrder).toEqual([
            "incoming",
            "title",
            "level",
            "Is Rebrand",
        ]);
    });

    it("lets the URL override the localStorage prefs", () => {
        localStorage.setItem(
            "test-grid-column-hidden",
            JSON.stringify(["incoming"])
        );
        // cols=ti => only title visible; URL wins over the localStorage hidden set
        window.history.replaceState(null, "", "/grid/books?cols=ti");
        mount();
        expect(api.hiddenColumnNames).toEqual([
            "incoming",
            "level",
            "Is Rebrand",
        ]);
    });
});
