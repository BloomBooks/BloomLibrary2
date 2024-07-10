// // this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
// import css from "@emotion/css/macro";
// // these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import { IGridColumn } from "../Grid/GridColumns";
import { TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { Filter, Sorting } from "@devexpress/dx-react-grid";
import {
    filterDateStringWithOperator,
    filterNumberWithOperator,
    filterSimpleString,
    filterStringWithNegation,
    IMinimalBookInfo,
} from "../NonBookGrid/NonBookGridPage";

export interface ILanguageGridRowData {
    langTag: string; // ISO code
    name: string; // language name
    endonym: string; // language name in the language itself
    otherNames: string[];
    firstSeen: string; // ISO date
    bookCount: number;
    uploaderCount: number;
    uploaderEmails: string[]; // Staff only
    countryNames: string[];
    level1Count: number;
    level2Count: number;
    level3Count: number;
    level4Count: number;
}

// Define the function getLanguageGridColumnsDefinitions
export function getLanguageGridColumnsDefinitions(): IGridColumn[] {
    const definitions: IGridColumn[] = [
        {
            name: "name",
            title: "Name",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.name,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "name",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "endonym",
            title: "Endonym",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.endonym,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "endonym",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "otherNames",
            title: "Other Names?",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) =>
                lang.otherNames.join(", "),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "otherNames",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "langTag",
            title: "Lang Tag",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.langTag,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "langTag",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "firstSeen",
            title: "First Seen",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) =>
                lang.firstSeen.substring(0, 10),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "firstSeen",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "bookCount",
            title: "Book Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.bookCount,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "bookCount",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "level1Count",
            title: "Level 1 Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.level1Count,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "level1Count",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "level2Count",
            title: "Level 2 Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.level2Count,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "level2Count",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "level3Count",
            title: "Level 3 Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.level3Count,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "level3Count",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "level4Count",
            title: "Level 4 Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.level4Count,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "level4count",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "uploaderCount",
            title: "Uploader Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.uploaderCount,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "uploaderCount",
                    operation: "lessThanOrEqual",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "uploaderEmails",
            title: "Uploader Emails",
            moderatorOnly: true,
            defaultVisible: false, // Staff only
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) =>
                lang.uploaderEmails.join(", "),
            /* Must be able to filter by, e.g. "sil.org" */
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "uploaderEmails",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
        {
            name: "countryNames",
            title: "Country Names",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) =>
                lang.countryNames.join(", "),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "countryNames",
                    operation: "contains",
                };
                const updatedProps: TableFilterRow.CellProps = {
                    ...props,
                    filter: fixedFilter,
                };
                return <TableFilterRow.Cell {...updatedProps} />;
            },
        },
    ];
    return definitions;
}

export function filterBooksBeforeCreatingLanguageGridRows(
    book: IMinimalBookInfo,
    gridFilters: Filter[]
): boolean {
    let keep = true;
    gridFilters.forEach((gf) => {
        if (!gf.value || !gf.value.trim()) return;
        if (gf.columnName === "uploaderEmails") {
            if (
                !filterStringWithNegation(
                    gf.value.trim(),
                    book.uploader?.username || ""
                )
            ) {
                keep = false;
                return;
            }
        } else if (gf.columnName === "firstSeen") {
            if (
                !filterDateStringWithOperator(gf.value.trim(), book.createdAt)
            ) {
                keep = false;
                return;
            }
        }
    });
    return keep;
}

export function compareLanguageGridRows(
    a: ILanguageGridRowData,
    b: ILanguageGridRowData,
    sortings: readonly Sorting[]
): number {
    for (let i = 0; i < sortings.length; i++) {
        const s = sortings[i];
        switch (s.columnName) {
            case "langTag":
                if (a.langTag < b.langTag) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.langTag > b.langTag) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "name":
                if (a.name < b.name) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.name > b.name) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "endoynm":
                if (a.endonym < b.endonym) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.endonym > b.endonym) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "otherNames":
                const aOtherNames = a.otherNames.sort().join(", ");
                const bOtherNames = b.otherNames.sort().join(", ");
                if (aOtherNames < bOtherNames) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (aOtherNames > bOtherNames) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "firstSeen":
                if (a.firstSeen < b.firstSeen) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.firstSeen > b.firstSeen) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "bookCount":
                if (a.bookCount < b.bookCount) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.bookCount > b.bookCount) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "level1Count":
                if (a.level1Count < b.level1Count) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.level1Count > b.level1Count) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "level2Count":
                if (a.level2Count < b.level2Count) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.level2Count > b.level2Count) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "level3Count":
                if (a.level3Count < b.level3Count) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.level3Count > b.level3Count) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "level4Count":
                if (a.level4Count < b.level4Count) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.level4Count > b.level4Count) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "uploaderCount":
                if (a.uploaderCount < b.uploaderCount) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.uploaderCount > b.uploaderCount) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "uploaderEmails":
                const aUploaderEmails = a.uploaderEmails.sort().join(", ");
                const bUploaderEmails = b.uploaderEmails.sort().join(", ");
                if (aUploaderEmails < bUploaderEmails) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (aUploaderEmails > bUploaderEmails) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "countryNames":
                const aCountryNames = a.countryNames.sort().join(", ");
                const bCountryNames = b.countryNames.sort().join(", ");
                if (aCountryNames < bCountryNames) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (aCountryNames > bCountryNames) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            default:
                console.error(`Unknown column ${s.columnName}`);
        }
    }
    return 0;
}

export function filterLanguageGridRow(
    row: ILanguageGridRowData,
    gridFilters: Filter[]
): boolean {
    for (let i = 0; i < gridFilters.length; i++) {
        const filter = gridFilters[i];
        if (!applyGridFilterToRow(row, filter)) {
            return false;
        }
    }
    return true;
}
function applyGridFilterToRow(
    row: ILanguageGridRowData,
    filter: Filter
): boolean {
    if (!filter?.value || !filter.value.trim()) return true;
    switch (filter.columnName) {
        case "langTag":
            return filterSimpleString(filter.value, row.langTag);
        case "name":
            return filterSimpleString(filter.value, row.name);
        case "endonym":
            return filterSimpleString(filter.value, row.endonym);
        case "otherNames":
            return (
                row.otherNames.filter((name) =>
                    filterSimpleString(filter.value || "", name)
                ).length > 0
            );
        case "firstSeen":
            // handled in the filterBooksBeforeCreatingRows function
            break;
        case "bookCount":
            return filterNumberWithOperator(filter.value, row.bookCount);
        case "level1Count":
            return filterNumberWithOperator(filter.value, row.level1Count);
        case "level2Count":
            return filterNumberWithOperator(filter.value, row.level2Count);
        case "level3Count":
            return filterNumberWithOperator(filter.value, row.level3Count);
        case "level4Count":
            return filterNumberWithOperator(filter.value, row.level4Count);
        case "uploaderCount":
            return filterNumberWithOperator(filter.value, row.uploaderCount);
        case "uploaderEmails":
            // handled in the filterBooksBeforeCreatingRows function
            break;
        case "countryNames":
            return (
                row.countryNames.filter((country) =>
                    filterSimpleString(filter.value || "", country)
                ).length > 0
            );
    }
    return true;
}

// When filtering on lists, hide values that are filtered out without
// changing the underlying data.
export function adjustListDisplaysForFiltering(
    columnDefinitions: IGridColumn[],
    filters: Filter[]
) {
    const colDef1 = columnDefinitions.find((c) => c.name === "countryNames");
    if (colDef1) {
        const filterDef = filters.find((f) => f.columnName === "countryNames");
        if (filterDef && filterDef.value) {
            colDef1.getCellValue = (lang: ILanguageGridRowData) =>
                lang.countryNames
                    .filter((x) => {
                        return filterSimpleString(filterDef.value || "", x);
                    })
                    .join(", ");
        } else {
            colDef1.getCellValue = (lang: ILanguageGridRowData) =>
                lang.countryNames.join(", ");
        }
    }
    const colDef2 = columnDefinitions.find((c) => c.name === "otherNames");
    if (colDef2) {
        const filterDef = filters.find((f) => f.columnName === "otherNames");
        if (filterDef && filterDef.value) {
            colDef2.getCellValue = (lang: ILanguageGridRowData) =>
                lang.otherNames
                    .filter((x) => {
                        return filterSimpleString(filterDef.value || "", x);
                    })
                    .join(", ");
        } else {
            colDef2.getCellValue = (lang: ILanguageGridRowData) =>
                lang.otherNames.join(", ");
        }
    }
}
