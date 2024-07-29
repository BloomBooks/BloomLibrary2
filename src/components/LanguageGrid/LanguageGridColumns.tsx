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

export interface ILanguageGridRowData {
    langTag: string; // ISO code
    exonym: string; // language name
    endonym: string; // language name in the language itself
    otherNames: string[];
    firstSeen: string; // ISO date
    bookCount: number;
    uploaderCount: number;
    uploaderEmails: string[]; // Staff only
    countryName: string;
    level1Count: number;
    level2Count: number;
    level3Count: number;
    level4Count: number;
}

// Define the function getLanguageGridColumnsDefinitions
export function getLanguageGridColumnsDefinitions(): IGridColumn[] {
    const definitions: IGridColumn[] = [
        {
            name: "exonym", // outsider name
            title: "Exonym",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => {
                const hrefValue = `/language:${lang.langTag}`;
                return (
                    // we don't need rel="noreferrer" because the destination is on the same website,
                    // and we want to preserve the login status for the new tab
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a href={hrefValue} target="_blank">
                        {lang.exonym}
                    </a>
                );
            },
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "exonym",
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
            name: "endonym", // insider name
            title: "Endonym",
            defaultVisible: false,
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
            title: "Other Name",
            defaultVisible: false,
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
            defaultVisible: false,
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
            defaultVisible: false,
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
            defaultVisible: false,
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
            defaultVisible: false,
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
            defaultVisible: false,
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
            defaultVisible: false,
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
            title: "Uploaders",
            moderatorOnly: true,
            defaultVisible: false, // Staff only
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => {
                const links = lang.uploaderEmails.map((email, index) => {
                    const hrefValue = `/:search:uploader:${email}`;
                    let separator = "";
                    if (index < lang.uploaderEmails.length - 1) {
                        separator = ", ";
                    }
                    return (
                        <span>
                            {/* we don't need rel="noreferrer" because the destination is on the same website,
                                and we want to preserve the login status for the new tab */}
                            {/*eslint-disable-next-line react/jsx-no-target-blank*/}
                            <a href={hrefValue} target="_blank">
                                {email}
                            </a>
                            {separator}
                        </span>
                    );
                });
                return <div>{links}</div>;
            },
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
            name: "countryName",
            title: "Country",
            defaultVisible: false,
            sortingEnabled: true,
            getCellValue: (lang: ILanguageGridRowData) => lang.countryName,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => {
                const fixedFilter: Filter = {
                    columnName: "countryName",
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
                !filterSimpleString(
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
            case "exonym":
                if (a.exonym < b.exonym) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.exonym > b.exonym) {
                    return s.direction === "asc" ? 1 : -1;
                }
                break;
            case "endonym":
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
            case "countryName":
                if (a.countryName < b.countryName) {
                    return s.direction === "asc" ? -1 : 1;
                } else if (a.countryName > b.countryName) {
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
    const filterValue = filter.value.trim();
    switch (filter.columnName) {
        case "langTag":
            return filterSimpleString(filterValue, row.langTag);
        case "exonym":
            return filterSimpleString(filterValue, row.exonym);
        case "endonym":
            return filterSimpleString(filterValue, row.endonym);
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
            return filterNumberWithOperator(filterValue, row.bookCount);
        case "level1Count":
            return filterNumberWithOperator(filterValue, row.level1Count);
        case "level2Count":
            return filterNumberWithOperator(filterValue, row.level2Count);
        case "level3Count":
            return filterNumberWithOperator(filterValue, row.level3Count);
        case "level4Count":
            return filterNumberWithOperator(filterValue, row.level4Count);
        case "uploaderCount":
            return filterNumberWithOperator(filterValue, row.uploaderCount);
        case "uploaderEmails":
            // handled in the filterBooksBeforeCreatingRows function
            break;
        case "countryName":
            return filterSimpleString(filterValue, row.countryName);
    }
    return true;
}

// When filtering on lists, hide values that are filtered out without
// changing the underlying data.
export function adjustListDisplaysForFiltering(
    columnDefinitions: IGridColumn[],
    filters: Filter[]
) {
    // may need if we go back to allowing multiple countries per language
    // const countryNamesColDef = columnDefinitions.find(
    //     (c) => c.name === "countryNames"
    // );
    // if (countryNamesColDef) {
    //     const filterDef = filters.find((f) => f.columnName === "countryNames");
    //     if (filterDef && filterDef.value && filterDef.value.trim()) {
    //         const filterValue = filterDef.value.trim();
    //         countryNamesColDef.getCellValue = (lang: ILanguageGridRowData) =>
    //             lang.countryNames
    //                 .filter((x) => filterSimpleString(filterValue, x))
    //                 .join(", ");
    //     } else {
    //         countryNamesColDef.getCellValue = (lang: ILanguageGridRowData) =>
    //             lang.countryNames.join(", ");
    //     }
    // }
    const otherNamesColDef = columnDefinitions.find(
        (c) => c.name === "otherNames"
    );
    if (otherNamesColDef) {
        const filterDef = filters.find((f) => f.columnName === "otherNames");
        if (filterDef && filterDef.value && filterDef.value.trim()) {
            const filterValue = filterDef.value.trim();
            otherNamesColDef.getCellValue = (lang: ILanguageGridRowData) => {
                return lang.otherNames
                    .filter((x) => filterSimpleString(filterValue, x))
                    .join(", ");
            };
        } else {
            otherNamesColDef.getCellValue = (lang: ILanguageGridRowData) =>
                lang.otherNames.join(", ");
        }
    }
}
