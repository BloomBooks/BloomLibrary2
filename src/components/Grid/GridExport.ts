import { exportCsv } from "../../export/exportData";
import { Book, createBookFromParseServerData } from "../../model/Book";
import { CachedTables } from "../../model/CacheProvider";
import { IFilter } from "../../IFilter";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";
import {
    constructParseSortOrder,
    constructParseBookQuery,
    joinBooksAndStats,
} from "../../connection/LibraryQueryHooks";
import {
    retrieveBookData,
    retrieveBookStats,
} from "../../connection/LibraryQueries";
import { getBookGridColumnsDefinitions, IGridColumn } from "./GridColumns";

let static_books: Book[] = [];
let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_sortingArray: Array<{
    columnName: string;
    descending: boolean;
}> = [];
let static_completeFilter: IFilter;

const static_keyToColumnDefinition: Map<
    string,
    IGridColumn
> = getBookGridColumnsDefinitions().reduce(
    (mapAccumulator, columnDefinition) => {
        mapAccumulator.set(columnDefinition.name, columnDefinition);
        return mapAccumulator;
    },
    new Map<string, IGridColumn>()
);

export function setGridExportFilter(
    completeFilter: IFilter, //includes the search box
    gridColumnFilters: GridFilter[] //just the filters from the headers of the columns
): void {
    static_completeFilter = completeFilter;
    // we don't need the gridColumnFilters, but this method matches a specified signature
}

export function setGridExportColumnInfo(
    columnsInOrder: string[],
    hiddenColumns: string[],
    sortingArray: Array<{ columnName: string; descending: boolean }>
) {
    static_columnsInOrder = columnsInOrder;
    static_hiddenColumns = hiddenColumns;
    static_sortingArray = sortingArray;
}

export function getAllGridDataAndExportCsv(): void {
    const order = constructParseSortOrder(static_sortingArray);
    const query = constructParseBookQuery(
        {},
        static_completeFilter,
        CachedTables.tags
    );
    const bookDataPromise = retrieveBookData(query, order, 0, 10000000);
    const bookStatsPromise = retrieveBookStats(query, order, 0, 10000000);
    Promise.all([bookDataPromise, bookStatsPromise]).then(
        ([bookData, bookStats]) => {
            const totalMatchingBooksCount = bookData.data["count"] as number;
            if (!totalMatchingBooksCount) return;
            static_books = bookData.data["results"].map((r: object) =>
                createBookFromParseServerData(r)
            );
            joinBooksAndStats(static_books, bookStats.data);

            exportCsv("Grid", exportData);
            static_books = []; // allow garbage collection since we don't need this data any longer.
        }
    );
}

function exportData(): string[][] {
    const all: string[][] = [];
    if (!static_books || !static_books.length) return all;
    const headerRow = static_columnsInOrder.filter(
        (item) => !static_hiddenColumns.includes(item)
    );

    // Add url after title; if no title, add url as first column
    const iTitle = headerRow.indexOf("title");
    headerRow.splice(iTitle + 1, 0, "url");

    all.push(
        headerRow.map(
            (key) => static_keyToColumnDefinition.get(key)?.title ?? key
        )
    );

    static_books.forEach((book) => {
        const valueRow = headerRow.map((key) => getStringForItem(book, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(book: Book, key: string): string {
    // getCellValue is used to get the value of a cell in the grid.
    // If it exists, and the result is not an object (React component),
    // use its result so we can share the code.
    // Otherwise, we have to handle the differences below.
    const columnDefinition = static_keyToColumnDefinition.get(key);
    if (columnDefinition?.getCellValue) {
        const valAsAny = columnDefinition.getCellValue(book, key);
        if (valAsAny !== undefined && typeof valAsAny !== "object") {
            return valAsAny.toString();
        }
    }
    switch (key) {
        // url is specific to the export, not a column in the grid
        case "url":
            // Excel and Google Sheets will interpret =HYPERLINK to make it a link, even in a csv. Supposedly Libre Office will, too.
            return `=HYPERLINK("${window.location.origin}/book/${book.id}")`;

        // The rest of these are react components in the grid, so we have to have special handling for them here.
        case "uploader":
            return book.uploader?.username ?? "";
        case "topic":
            return book.tags
                .filter((tag) => tag.startsWith("topic:"))
                .map((topic) => topic.replace("topic:", ""))
                .join(", ");
        case "incoming":
            return book.tags.filter((tag) => tag === "system:Incoming").length
                ? "true"
                : "false";
        case "Is Rebrand":
            return book.rebrand ? "true" : "false";
    }

    // The grid didn't provide a getCellValue function for this column (or the result was an object)
    // and we didn't have a special case for it above.
    // Just get the raw value from the book object based on the key.
    const item = book[key as keyof Book];
    return item ? item.toString() : "";
}
