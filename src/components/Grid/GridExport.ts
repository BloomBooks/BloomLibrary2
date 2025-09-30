import { exportCsv } from "../../export/exportData";
import { Book } from "../../model/Book";
import { IFilter } from "../../IFilter";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";
import { getBookGridColumnsDefinitions, IGridColumn } from "./GridColumns";
import { DataLayerFactory } from "../../data-layer/factory/DataLayerFactory";
import { BookModel } from "../../data-layer/models/BookModel";
import { BookGridQuery } from "../../data-layer/types/QueryTypes";
import {
    BookOrderingScheme,
    Sorting,
} from "../../data-layer/types/CommonTypes";
import { BookFilter } from "../../data-layer/types/FilterTypes";
import { convertIFilterToBookFilter } from "../../connection/LibraryQueryHooks";

let static_books: Book[] = [];
let static_columnsInOrder: string[] = [];
let static_hiddenColumns: string[] = [];
let static_sortingArray: Array<{
    columnName: string;
    descending: boolean;
}> = [];
let static_completeFilter: IFilter;

const static_keyToColumnDefinition: Map<string, IGridColumn> = new Map();
getBookGridColumnsDefinitions().forEach((columnDefinition) => {
    static_keyToColumnDefinition.set(columnDefinition.name, columnDefinition);
});

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

export async function getAllGridDataAndExportCsv(): Promise<void> {
    try {
        const factory = DataLayerFactory.getInstance();
        const bookRepository = factory.createBookRepository();

        // Convert IFilter to BookFilter format
        const bookFilter = convertIFilterToBookFilter(static_completeFilter);

        // Convert sorting array to repository format
        const sorting: Sorting[] = static_sortingArray.map((sort) => ({
            columnName: sort.columnName,
            descending: sort.descending,
        }));

        // Create the query
        const query: BookGridQuery = {
            filter: bookFilter,
            sorting: sorting,
            pagination: {
                limit: 10000000, // Large limit to get all matching results
                skip: 0,
            },
        };

        // Get the data using repository
        const result = await bookRepository.getBooksForGrid(query);

        if (!result.totalMatchingBooksCount) return;

        // Convert BookModels to Books for compatibility with existing export logic
        static_books = result.onePageOfMatchingBooks.map((bookModel: any) => {
            const book = new Book();
            Object.assign(book, bookModel);
            return book;
        });

        exportCsv("Grid", exportData);
        static_books = []; // allow garbage collection since we don't need this data any longer.
    } catch (error) {
        console.error("Error exporting grid data:", error);
        // TODO: Show user-friendly error message
    }
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
    // url is a special case since it only exists in the export, not in the grid.
    if (key === "url") {
        // Excel and Google Sheets will interpret =HYPERLINK to make it a link, even in a csv. Supposedly Libre Office will, too.
        return `=HYPERLINK("${window.location.origin}/book/${book.id}")`;
    }

    // Try getStringValue first. If defined, that's what we want; just the string representation.
    const columnDefinition = static_keyToColumnDefinition.get(key);
    if (columnDefinition?.getStringValue)
        return columnDefinition.getStringValue(book);

    // Otherwise, we might just want the same value as the grid shows.
    // But not if the result is an object (React component).
    if (columnDefinition?.getCellValue) {
        const valAsAny = columnDefinition.getCellValue(book, key);
        if (valAsAny !== undefined && typeof valAsAny !== "object") {
            return valAsAny.toString();
        }
    }

    // If there's no getStringValue or getCellValue (or getCellValue returns a component),
    // just get the raw value from the book object based on the key.
    const item = book[key as keyof Book];
    return item ? item.toString() : "";
}
