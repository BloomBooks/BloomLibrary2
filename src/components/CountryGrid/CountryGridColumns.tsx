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
    filterNumberWithOperator,
    filterSimpleString,
    filterStringWithNegation,
} from "../AggregateGrid/AggregateGridPage";
import { IMinimalBookInfo } from "../AggregateGrid/AggregateGridInterfaces";

export interface ICountryGridRowData {
    name: string; // country name
    code: string; // country ISO code
    knownLanguageCount: number;
    knownLanguageTags: string[]; // (not displayed)
    blorgLanguageCount: number;
    blorgLanguageTags: string[];
    bookCount: number;
}

// Define the function getCountryGridColumnsDefinitions
export function getCountryGridColumnsDefinitions(): IGridColumn[] {
    const definitions: IGridColumn[] = [
        {
            name: "name",
            title: "Country",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: ICountryGridRowData) => row.name,
            /*addToFilter: (filter: IFilter, value: string) => {}*/
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
            name: "code",
            title: "Code",
            defaultVisible: false,
            sortingEnabled: true,
            getCellValue: (row: ICountryGridRowData) => row.code,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "code",
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
            name: "knownLanguageCount",
            title: "Language Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: ICountryGridRowData) => row.knownLanguageCount,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "knownLanguageCount",
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
            name: "blorgLanguageCount",
            title: "BloomLibrary Language Count",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (row: ICountryGridRowData) => row.blorgLanguageCount,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "blorgLanguageCount",
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
            name: "blorgLanguageTags",
            title: "BloomLibrary Language Tags",
            defaultVisible: false, // Staff only
            sortingEnabled: true,
            getCellValue: (row: ICountryGridRowData) =>
                row.blorgLanguageTags.join(", "),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "blorgLanguageTags",
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
            getCellValue: (row: ICountryGridRowData) => row.bookCount,
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
    ];
    return definitions;
}

export function filterBooksBeforeCreatingCountryGridRows(
    book: IMinimalBookInfo,
    gridFilters: Filter[]
): boolean {
    if (!book.lang1Tag) return false;
    const filter = gridFilters.find(
        (f) => f.columnName === "blorgLanguageTags"
    );
    if (filter && filter.value) {
        const filterValue = filter.value.trim();
        if (!filterValue) return true;
        if (!filterStringWithNegation(filterValue, book.lang1Tag)) {
            return false;
        }
    }
    return true;
}

export function compareCountryGridRows(
    a: ICountryGridRowData,
    b: ICountryGridRowData,
    sortings: readonly Sorting[]
): number {
    for (let i = 0; i < sortings.length; i++) {
        const s = sortings[i];
        switch (s.columnName) {
            case "name":
                if (a.name < b.name) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.name > b.name) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "code":
                if (a.code < b.code) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.code > b.code) {
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
            case "blorgLanguageCount":
                if (a.blorgLanguageCount < b.blorgLanguageCount) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.blorgLanguageCount > b.blorgLanguageCount) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "blorgLanguageTags":
                const blorgLanguageTags1 = a.blorgLanguageTags
                    .sort()
                    .join(", ");
                const blorgLanguageTags2 = b.blorgLanguageTags
                    .sort()
                    .join(", ");
                if (blorgLanguageTags1 < blorgLanguageTags2) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (blorgLanguageTags1 > blorgLanguageTags2) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "knownLanguageCount":
                if (a.knownLanguageCount < b.knownLanguageCount) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.knownLanguageCount > b.knownLanguageCount) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            default:
                console.error(`Unknown column ${s.columnName}`);
        }
    }
    return 0;
}

export function filterCountryGridRow(
    row: ICountryGridRowData,
    gridFilters: Filter[]
): boolean {
    for (let i = 0; i < gridFilters.length; i++) {
        const filter = gridFilters[i];
        if (!filter.value || !filter.value.trim()) {
            continue;
        }
        switch (filter.columnName) {
            case "name":
                if (!filterSimpleString(filter.value, row.name)) return false;
                break;
            case "code":
                if (!filterSimpleString(filter.value, row.code)) return false;
                break;
            case "knownLanguageCount":
                if (
                    !filterNumberWithOperator(
                        filter.value,
                        row.knownLanguageCount
                    )
                )
                    return false;
                break;
            case "bookCount":
                if (!filterNumberWithOperator(filter.value, row.bookCount))
                    return false;
                break;
            case "blorgLanguageCount":
                if (
                    !filterNumberWithOperator(
                        filter.value,
                        row.blorgLanguageCount
                    )
                )
                    return false;
                break;
            case "blorgLanguageTags":
                // handled in the filterBooksBeforeCreatingCountryGridRows function
                break;
        }
    }
    return true;
}
