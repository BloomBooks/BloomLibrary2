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
let harnessOptions:
    | { initialFilters?: GridFilter[]; availableColumnNames?: string[] }
    | undefined;
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
    localStorage.clear(); // isolate the personal saved view between tests
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

    it("mirrors seeded initialFilters into a bare URL on mount (so the shown view is shareable)", () => {
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
        // The grid is filtered AND the address bar reflects it, so copying the URL reproduces it.
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
        expect(param("in")).toBe("true");
    });

    it("does not let a bare/empty filter param clobber initialFilters", () => {
        harnessOptions = {
            initialFilters: [
                {
                    columnName: "incoming",
                    operation: "contains",
                    value: "true",
                },
            ],
        };
        // ?ti= carries no real filter; the seeded initialFilters must survive.
        window.history.replaceState(null, "", "/grid/books?ti=");
        mount();
        expect(api.gridFilters).toEqual([
            { columnName: "incoming", operation: "contains", value: "true" },
        ]);
    });
});

describe("personal saved view (columns/sort/widths in localStorage; a URL with grid params still wins)", () => {
    it("a bare URL with nothing saved yields the factory-default view and stays bare", () => {
        mount();
        expect(window.location.search).toBe("");
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
    });

    it("remembers a layout change and restores it on a later bare-URL visit, backfilling the URL", () => {
        mount();
        act(() => api.setHiddenColumnNames([...DEFAULT_HIDDEN, "incoming"]));
        expect(param("cols")).toBe("ti");
        // The layout (and only the layout) was remembered, in the same compact cols encoding.
        expect(localStorage.getItem("test-grid-cols")).toBe("ti");
        // A fresh visit on a bare URL restores it...
        unmount();
        window.history.replaceState(null, "", "/grid/books");
        mount();
        expect(api.hiddenColumnNames).toEqual([
            "incoming",
            "level",
            "Is Rebrand",
        ]);
        // ...and mirrors it into the address bar, so the shown view is shareable as-is.
        expect(param("cols")).toBe("ti");
    });

    it("restores a saved reorder on a bare URL", () => {
        localStorage.setItem("test-grid-cols", "in,ti");
        mount();
        expect(api.columnNamesInDisplayOrder).toEqual([
            "incoming",
            "title",
            "level",
            "Is Rebrand",
        ]);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
        expect(param("cols")).toBe("in,ti"); // backfilled
    });

    it("remembers sort and widths, restores them on a bare visit; filters are NOT remembered", () => {
        mount();
        act(() =>
            api.setSortings([{ columnName: "level", direction: "desc" }])
        );
        act(() =>
            api.setColumnWidths([
                { columnName: "title", width: 250 },
                { columnName: "incoming", width: "auto" },
                { columnName: "level", width: "auto" },
                { columnName: "Is Rebrand", width: "auto" },
            ])
        );
        act(() =>
            api.setGridFilters([
                { columnName: "title", operation: "contains", value: "math" },
            ])
        );
        expect(localStorage.getItem("test-grid-sort")).toBe("lv:desc");
        expect(localStorage.getItem("test-grid-widths")).toBe("ti:250");
        unmount();
        window.history.replaceState(null, "", "/grid/books");
        mount();
        // sort + widths came back (and were backfilled into the URL)...
        expect(api.sortings).toEqual([
            { columnName: "level", direction: "desc" },
        ]);
        expect(
            api.columnWidths.find((w) => w.columnName === "title")!.width
        ).toBe(250);
        expect(param("sort")).toBe("lv:desc");
        expect(param("widths")).toBe("ti:250");
        // ...but the filter did not (a silently re-applied filter reads as missing books).
        expect(api.gridFilters).toEqual([]);
        expect(param("ti")).toBeNull();
    });

    it("clearing the sort forgets it (URL and storage stay clean)", () => {
        mount();
        act(() =>
            api.setSortings([{ columnName: "level", direction: "desc" }])
        );
        expect(localStorage.getItem("test-grid-sort")).toBe("lv:desc");
        act(() => api.setSortings([]));
        expect(param("sort")).toBeNull();
        expect(localStorage.getItem("test-grid-sort")).toBeNull();
    });

    it("returning to the factory default forgets the saved layout (URL and storage stay clean)", () => {
        mount();
        act(() => api.setHiddenColumnNames([...DEFAULT_HIDDEN, "incoming"]));
        expect(localStorage.getItem("test-grid-cols")).toBe("ti");
        act(() => api.setHiddenColumnNames(DEFAULT_HIDDEN));
        expect(param("cols")).toBeNull();
        expect(localStorage.getItem("test-grid-cols")).toBeNull();
    });

    it("never mixes the saved layout into a URL that already has grid params (shared link)", () => {
        localStorage.setItem("test-grid-cols", "in,ti");
        window.history.replaceState(null, "", "/grid/books?ti=math");
        mount();
        // The link is respected as-is: its filter stays, the personal layout is NOT applied...
        expect(param("ti")).toBe("math");
        expect(param("cols")).toBeNull();
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
        // ...and merely viewing the link does not disturb the saved layout.
        expect(localStorage.getItem("test-grid-cols")).toBe("in,ti");
    });

    it("lets cols in the URL override the saved layout (unlisted = hidden)", () => {
        localStorage.setItem("test-grid-cols", "in,ti");
        window.history.replaceState(null, "", "/grid/books?cols=ti");
        mount();
        expect(api.hiddenColumnNames).toEqual([
            "incoming",
            "level",
            "Is Rebrand",
        ]);
        expect(localStorage.getItem("test-grid-cols")).toBe("in,ti");
    });

    it("resetView returns to the factory default and forgets the saved view (but keeps filters)", () => {
        mount();
        act(() => api.setHiddenColumnNames([...DEFAULT_HIDDEN, "incoming"]));
        act(() =>
            api.setSortings([{ columnName: "level", direction: "desc" }])
        );
        act(() =>
            api.setColumnWidths([
                { columnName: "title", width: 250 },
                { columnName: "incoming", width: "auto" },
                { columnName: "level", width: "auto" },
                { columnName: "Is Rebrand", width: "auto" },
            ])
        );
        act(() =>
            api.setGridFilters([
                { columnName: "title", operation: "contains", value: "math" },
            ])
        );
        act(() => api.resetView());
        // The view is factory default again...
        expect(api.columnNamesInDisplayOrder).toEqual(DEFAULT_ORDER);
        expect(api.hiddenColumnNames).toEqual(DEFAULT_HIDDEN);
        expect(api.sortings).toEqual([]);
        expect(api.columnWidths.every((w) => w.width === "auto")).toBe(true);
        // ...nothing view-related is left in the URL or storage...
        expect(param("cols")).toBeNull();
        expect(param("sort")).toBeNull();
        expect(param("widths")).toBeNull();
        expect(localStorage.getItem("test-grid-cols")).toBeNull();
        expect(localStorage.getItem("test-grid-sort")).toBeNull();
        expect(localStorage.getItem("test-grid-widths")).toBeNull();
        // ...but the filter (visible in the filter row, never persisted) survives.
        expect(api.gridFilters).toEqual([
            { columnName: "title", operation: "contains", value: "math" },
        ]);
        expect(param("ti")).toBe("math");
    });
});

describe("availableColumnNames (role-restricted columns from a shared link)", () => {
    it("drops sort/filter on a column this user cannot see", () => {
        // A shared link sorts and filters by `level`, but this user's available set excludes it
        // (as if `level` were moderator-only and the viewer is not a moderator).
        harnessOptions = {
            availableColumnNames: ["title", "incoming", "Is Rebrand"],
        };
        window.history.replaceState(null, "", "/grid/books?sort=lv:asc&lv=4");
        mount();
        expect(api.sortings).toEqual([]);
        expect(api.gridFilters).toEqual([]);
        // Column order still spans every definition (unchanged behavior).
        expect(api.columnNamesInDisplayOrder).toContain("level");
    });

    it("honors sort/filter on a column the user CAN see", () => {
        harnessOptions = { availableColumnNames: DEFAULT_ORDER };
        window.history.replaceState(null, "", "/grid/books?sort=lv:asc&lv=4");
        mount();
        expect(api.sortings).toEqual([
            { columnName: "level", direction: "asc" },
        ]);
        expect(api.gridFilters).toEqual([
            { columnName: "level", operation: "contains", value: "4" },
        ]);
    });

    it("does not lose a filter on an unavailable column when the user edits a visible one", () => {
        // 'level' is not available to this user; a shared link filters it plus 'title'.
        harnessOptions = {
            availableColumnNames: ["title", "incoming", "Is Rebrand"],
        };
        window.history.replaceState(null, "", "/grid/books?lv=4&ti=old");
        mount();
        expect(api.gridFilters).toEqual([
            { columnName: "title", operation: "contains", value: "old" },
        ]);
        // The user edits the visible title filter; DevExpress only hands back visible columns.
        act(() =>
            api.setGridFilters([
                { columnName: "title", operation: "contains", value: "new" },
            ])
        );
        // Still only title is visible to this user...
        expect(api.gridFilters).toEqual([
            { columnName: "title", operation: "contains", value: "new" },
        ]);
        // ...but the unavailable 'level' filter is preserved in state + URL (not clobbered).
        expect(param("lv")).toBe("4");
        expect(param("ti")).toBe("new");
    });

    it("does not lose a sort on an unavailable column when the user changes a visible one", () => {
        harnessOptions = {
            availableColumnNames: ["title", "incoming", "Is Rebrand"],
        };
        window.history.replaceState(null, "", "/grid/books?sort=lv:asc");
        mount();
        expect(api.sortings).toEqual([]);
        act(() =>
            api.setSortings([{ columnName: "title", direction: "desc" }])
        );
        expect(api.sortings).toEqual([
            { columnName: "title", direction: "desc" },
        ]);
        // Visible title sort plus the preserved (unavailable) level sort.
        expect(param("sort")).toBe("ti:desc,lv:asc");
    });
});
