import { axios } from "@use-hooks/axios";
import { getConnection } from "../../connection/ParseServerConnection";
import { exportCsv } from "../statistics/exportData";
import { Book, createBookFromParseServerData } from "../../model/Book";
import { CachedTables } from "../../model/CacheProvider";
import { IFilter } from "../../IFilter";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";
import {
    constructParseSortOrder,
    constructParseBookQuery,
} from "../../connection/LibraryQueryHooks";

let theBooks: Book[] = [];
let theColumnsInOrder: string[] = [];
let theHiddenColumns: string[] = [];
let theSortingArray: Array<{
    columnName: string;
    descending: boolean;
}> = [];
let theCompleteFilter: IFilter;
let theGridColumnFilters: GridFilter[];

export function setGridExportFilter(
    completeFilter: IFilter, //includes the search box
    gridColumnFilters: GridFilter[] //just the filters from the headers of the columns
): void {
    theCompleteFilter = completeFilter;
    theGridColumnFilters = gridColumnFilters;
}

export function setGridExportData(
    columnsInOrder: string[],
    hiddenColumns: string[],
    sortingArray: Array<{ columnName: string; descending: boolean }>
) {
    theColumnsInOrder = columnsInOrder;
    theHiddenColumns = hiddenColumns;
    theSortingArray = sortingArray;
}

export function getAllGridDataAndExportCsv(): void {
    const order = constructParseSortOrder(theSortingArray);
    const query = constructParseBookQuery(
        {},
        theCompleteFilter,
        CachedTables.tags
    );
    const retrieval = retrieveAllGridBookData(query, order);
    retrieval.then((data) => {
        const totalMatchingBooksCount = data["count"] as number;
        if (!totalMatchingBooksCount) return;
        theBooks = data["results"].map((r: object) =>
            createBookFromParseServerData(r)
        );
        exportCsv("Grid", exportData);
        theBooks = []; // allow garbage collection since we don't need this data any longer.
    });
}

function exportData(): string[][] {
    const all: string[][] = [];
    if (!theBooks || !theBooks.length) return all;
    const headerRow = theColumnsInOrder.filter(
        (item) => !theHiddenColumns.includes(item)
    );
    all.push(headerRow);

    theBooks.forEach((book) => {
        //const valueRow = Object.values(row).map((v) => v ? v.toString() : "") as string[];
        const valueRow = headerRow.map((key) => getStringForItem(book, key));
        all.push(valueRow);
    });
    return all;
}

function getStringForItem(book: Book, key: string): string {
    switch (key) {
        case "languages":
            return book.languages.map((lang) => lang.name).join(",");
        case "uploader":
            return book.uploader?.username ?? "";
        case "topic":
            return book.tags
                .filter((tag) => tag.startsWith("topic:"))
                .map((topic) => topic.replace("topic:", ""))
                .join(",");
        case "incoming":
            return book.tags.filter((tag) => tag === "system:Incoming").length
                ? "true"
                : "false";
    }
    let item = book[key as keyof Book];
    return item ? item.toString() : "";
}

// Get all the information for all the books currently displayed in the grid, as
// filtered and sorted by query and sortOrder.
export async function retrieveAllGridBookData(
    query: object,
    sortOrder: string
) {
    console.log(`DEBUG: query="${JSON.stringify(query)}"`);
    console.log(`DEBUG: sortOrder="${sortOrder}"`);
    const result = await axios.get(`${getConnection().url}classes/books`, {
        headers: getConnection().headers,
        params: {
            order: sortOrder,
            count: 1, // causes it to return the count
            limit: 100000000,
            keys:
                "title,baseUrl,license,licenseNotes,inCirculation,summary,copyright,harvestState,harvestLog," +
                "tags,pageCount,phashOfFirstContentImage,show,credits,country,features,internetLimits,bookshelves," +
                "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount,publisher,originalPublisher,keywords,edition,objectId,bookInstanceId",
            // fluff up fields that reference other tables
            include: "uploader,langPointers",
            ...query,
        },
    });
    return result.data;
}
