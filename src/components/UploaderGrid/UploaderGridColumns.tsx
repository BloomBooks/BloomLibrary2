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
} from "../AggregateGrid/AggregateGridPage";
import { IMinimalBookInfo } from "../AggregateGrid/AggregateGridInterfaces";

export interface IUploaderGridData {
    email: string; // uploader email
    bookCount: number;
    languages: string[]; // ISO codes
    countryNames: string[];
    creationDate: string; // creation of the uploader account
    organization?: string; // (not yet implemented)
    firstUploadDate?: string; // (not yet implemented)
    latestUploadDate?: string; // (not yet implemented)
}

// Define the function getUploaderGridColumnsDefinitions
export function getUploaderGridColumnsDefinitions(): IGridColumn[] {
    const definitions: IGridColumn[] = [
        {
            name: "email",
            title: "Email",
            moderatorOnly: true,
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) => row.email,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "email",
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
            name: "bookCount",
            title: "Book Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) => row.bookCount,
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
            name: "languages",
            title: "Languages",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) =>
                row.languages.filter(() => true).join(", "),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "languages",
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
            title: "Countries",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) =>
                row.countryNames.join(", "),
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
        {
            name: "creationDate",
            title: "Creation Date",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) =>
                row.creationDate.substring(0, 10),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "creationDate",
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
            name: "organization",
            title: "Organization",
            moderatorOnly: true,
            defaultVisible: false,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) => "Not Yet Implemented",
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "organization",
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
            name: "firstUploadDate",
            title: "First Upload or Update Date",
            moderatorOnly: true,
            defaultVisible: false,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) => "Not Yet Implemented",
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "firstUploadDate",
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
            name: "latestUploadDate",
            title: "Latest Upload or Update Date",
            moderatorOnly: true,
            defaultVisible: false,
            sortingEnabled: true,
            getCellValue: (row: IUploaderGridData) => "Not Yet Implemented",
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "latestUploadDate",
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

export function filterBooksBeforeCreatingUploaderGridRows(
    book: IMinimalBookInfo,
    gridFilters: Filter[]
): boolean {
    if (!book || !gridFilters) return false;
    // TODO: Filter languages and/or countryNames?
    return true;
}

export function compareUploaderGridRows(
    a: IUploaderGridData,
    b: IUploaderGridData,
    sortings: readonly Sorting[]
): number {
    for (let i = 0; i < sortings.length; i++) {
        const s = sortings[i];
        switch (s.columnName) {
            case "email":
                if (a.email < b.email) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.email > b.email) {
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
            case "languages":
                const aLanguages = a.languages.sort().join(", ");
                const bLanguages = b.languages.sort().join(", ");
                if (aLanguages < bLanguages) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (aLanguages > bLanguages) {
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
            case "creationDate":
                if (a.creationDate < b.creationDate) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.creationDate > b.creationDate) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "organization": // (not yet implemented)
                if (a.organization && b.organization) {
                    if (a.organization < b.organization) {
                        return s.direction === "asc" ? -1 : 1;
                    } else if (a.organization > b.organization) {
                        return s.direction === "asc" ? 1 : -1;
                    }
                } else if (a.organization) {
                    // push undefined to the end
                    return s.direction === "asc" ? -1 : 1;
                } else if (b.organization) {
                    // push undefined to the end
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "firstUploadDate": // (not yet implemented)
                if (a.firstUploadDate && b.firstUploadDate) {
                    if (a.firstUploadDate < b.firstUploadDate) {
                        return s.direction === "asc" ? -1 : 1;
                    } else if (a.firstUploadDate > b.firstUploadDate) {
                        return s.direction === "asc" ? 1 : -1;
                    }
                } else if (a.firstUploadDate) {
                    // push undefined to the end
                    return s.direction === "asc" ? -1 : 1;
                } else if (b.firstUploadDate) {
                    // push undefined to the end
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "latestUploadDate": // (not yet implemented)
                if (a.latestUploadDate && b.latestUploadDate) {
                    if (a.latestUploadDate < b.latestUploadDate) {
                        return s.direction === "asc" ? -1 : 1;
                    } else if (a.latestUploadDate > b.latestUploadDate) {
                        return s.direction === "asc" ? 1 : -1;
                    }
                } else if (a.latestUploadDate) {
                    // push undefined to the end
                    return s.direction === "asc" ? -1 : 1;
                } else if (b.latestUploadDate) {
                    // push undefined to the end
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            default:
                console.error(`Unknown column ${s.columnName}`);
        }
    }
    return 0;
}

export function filterUploaderGridRow(
    row: IUploaderGridData,
    gridFilters: Filter[]
): boolean {
    for (let i = 0; i < gridFilters.length; i++) {
        const filter = gridFilters[i];
        if (!filter.value || !filter.value.trim()) continue;
        switch (filter.columnName) {
            case "email":
                if (!filterSimpleString(filter.value, row.email)) return false;
                break;
            case "bookCount":
                if (!filterNumberWithOperator(filter.value, row.bookCount))
                    return false;
                break;
            case "languages":
                if (
                    row.languages.filter((x) =>
                        filterSimpleString(filter.value || "", x)
                    ).length === 0
                )
                    return false;
                break;
            case "countryNames":
                if (
                    row.countryNames.filter((x) =>
                        filterSimpleString(filter.value || "", x)
                    ).length === 0
                )
                    return false;
                break;
            case "creationDate":
                if (
                    !filterDateStringWithOperator(
                        filter.value,
                        row.creationDate
                    )
                )
                    return false;
                break;
            case "organization": // (not yet implemented)
                break;
            case "firstUploadDate": // (not yet implemented)
                break;
            case "latestUploadDate": // (not yet implemented)
                break;
        }
    }
    return true;
}

// When filtering on lists, hide values that are filtered out without
// changing the underlying data.
export function adjustListDisplaysForFiltering(
    columnDefinitions: IGridColumn[],
    gridFilters: Filter[]
) {
    const colDef1 = columnDefinitions.find((c) => c.name === "countryNames");
    if (colDef1) {
        const filterDef = gridFilters.find(
            (f) => f.columnName === "countryNames"
        );
        if (filterDef && filterDef.value) {
            colDef1.getCellValue = (row: IUploaderGridData) =>
                row.countryNames
                    .filter((x) => {
                        return !filterDef.value || x.includes(filterDef.value);
                    })
                    .join(", ");
        } else {
            colDef1.getCellValue = (row: IUploaderGridData) =>
                row.countryNames.join(", ");
        }
    }
    const colDef2 = columnDefinitions.find((c) => c.name === "languages");
    if (colDef2) {
        const filterDef = gridFilters.find((f) => f.columnName === "languages");
        if (filterDef && filterDef.value) {
            colDef2.getCellValue = (row: IUploaderGridData) =>
                row.languages
                    .filter((x) => {
                        return !filterDef.value || x.includes(filterDef.value);
                    })
                    .join(", ");
        } else {
            colDef2.getCellValue = (row: IUploaderGridData) =>
                row.languages.join(", ");
        }
    }
}
