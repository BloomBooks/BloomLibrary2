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
    retrieveAllGridBookData,
    retrieveAllGridBookStats,
} from "../../connection/LibraryQueries";

let static_books: Book[] = [];
let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_sortingArray: Array<{
    columnName: string;
    descending: boolean;
}> = [];
let static_completeFilter: IFilter;

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
    const bookDataPromise = retrieveAllGridBookData(query, order);
    const bookStatsPromise = retrieveAllGridBookStats(query, order);
    Promise.all([bookDataPromise, bookStatsPromise]).then(
        ([bookData, bookStats]) => {
            const totalMatchingBooksCount = bookData["count"] as number;
            if (!totalMatchingBooksCount) return;
            static_books = bookData["results"].map((r: object) =>
                createBookFromParseServerData(r)
            );
            joinBooksAndStats(static_books, bookStats);

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
    all.push(headerRow);

    static_books.forEach((book) => {
        //const valueRow = Object.values(row).map((v) => v ? v.toString() : "") as string[];
        const valueRow = headerRow.map((key) => getStringForItem(book, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(book: Book, key: string): string {
    switch (key) {
        case "languages":
            return book.languages.map((lang) => lang.name).join(", ");
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
        case "tags":
            return book.tags
                .filter(
                    (tag) =>
                        !tag.startsWith("topic:") && tag !== "system:Incoming"
                )
                .join(", ");
        case "reads":
            return book.stats.finishedCount.toString();
        case "downloadsForTranslation":
            return book.stats.shellDownloads.toString();
    }
    const item = book[key as keyof Book];
    return item ? item.toString() : "";
}
