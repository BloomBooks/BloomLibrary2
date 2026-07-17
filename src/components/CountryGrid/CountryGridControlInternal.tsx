import React, {
    useState,
    useEffect,
    useMemo,
    // ReactText,
    useContext,
} from "react";

import {
    Grid,
    Table,
    TableHeaderRow,
    TableColumnVisibility,
    Toolbar,
    ColumnChooser,
    TableFilterRow,
    PagingPanel,
    TableColumnResizing,
    DragDropProvider,
    TableColumnReordering,
} from "@devexpress/dx-react-grid-material-ui";

import {
    FilteringState,
    SortingState,
    PagingState,
    CustomPaging,
} from "@devexpress/dx-react-grid";
import { TableCell, useTheme } from "@material-ui/core";
import {
    ICountryGridRowData,
    compareCountryGridRows,
    filterCountryGridRow,
    getCountryGridColumnsDefinitions,
    adjustListDisplaysForFiltering,
} from "./CountryGridColumns";
import { IGridColumn, getColumnsVisibleToUser } from "../Grid/GridColumns";
import { useGridConfigInUrl } from "../Grid/useGridConfigInUrl";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { observer } from "mobx-react-lite";
import { ICountryGridControlProps } from "./CountryGridControl";
import { CachedTablesContext } from "../../model/CacheProvider";
import {
    CachedBookDataContext,
    fixLangTagRegionDataAndGetMap,
    getCountryIdMapFromLangTagData,
    getLangTagDataForIrregularLangCode,
    ModeratorStatusToolbarPlugin,
} from "../AggregateGrid/AggregateGridPage";
// import {
//     // ICountryIdData,
//     ILangTagData,
// } from "../AggregateGrid/AggregateGridInterfaces";

import rawLangData from "../AggregateGrid/reduced-langtags.json";
// if we go back to using the langtags regions field, we may need this data.
//const countryIdData: ICountryIdData[] = require("../statistics/country_ids.json");

// we need the observer in order to get the logged in user, which may not be immediately available
const CountryGridControlInternal: React.FunctionComponent<ICountryGridControlProps> = observer(
    (props) => {
        const setExportData = props.setExportData;
        const theme = useTheme();
        const { languagesByBookCount: languages } = useContext(
            CachedTablesContext
        );
        const user = useGetLoggedInUser();
        const [countryGridColumnDefinitions] = useState(
            getCountryGridColumnsDefinitions()
        );
        // The columns this user may see (some are moderator-/login-gated). Drives both the
        // rendered `columns` set and which URL sort/filter config the hook is allowed to honor.
        // user.moderator flips in place (same User object) shortly after login resolves; read it
        // during render so the mobx observer stays subscribed, and include it in the deps so the
        // memo recomputes -- the `user` identity alone never changes when the flag arrives.
        const isModerator = user?.moderator;
        const visibleColumnDefinitions = useMemo(
            () => getColumnsVisibleToUser(countryGridColumnDefinitions, user),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [countryGridColumnDefinitions, user, isModerator]
        );
        const availableColumnNames = useMemo(
            () => visibleColumnDefinitions.map((c) => c.name),
            [visibleColumnDefinitions]
        );
        // Grid configuration (sort, column filters, column order/visibility, widths) lives
        // in the URL so a view can be bookmarked/shared; a bare URL gets the user's saved
        // view (column layout, sort, widths -- never filters; localStorage), else the
        // column-definition defaults. See useGridConfigInUrl.
        const {
            sortings,
            setSortings,
            gridFilters,
            setGridFilters,
            columnNamesInDisplayOrder,
            setColumnNamesInDisplayOrder,
            hiddenColumnNames,
            setHiddenColumnNames,
            columnWidths,
            setColumnWidths,
            resetView,
        } = useGridConfigInUrl(countryGridColumnDefinitions, "country-grid", {
            availableColumnNames,
        });

        const { minimalBookInfo: bookData } = useContext(CachedBookDataContext);
        const [totalRowCount, setTotalRowCount] = useState(0);
        const [countryDataRows, setCountryDataRows] = useState<
            ICountryGridRowData[]
        >([]);
        const fullLangDataMap = useMemo(() => {
            return fixLangTagRegionDataAndGetMap(rawLangData);
        }, []);
        const countryIdMap = useMemo(() => {
            return getCountryIdMapFromLangTagData(rawLangData);
        }, []);

        // Create countryDataRows from languages and bookData.
        // countryIdMap (which is derived from langtags) is used to create the initial set
        // of rows and fill in some data.
        // fullLangDataMap is used to fill in some data.
        // Some gridFilters are applied to the bookData before creating the rows.
        useEffect(() => {
            if (
                languages &&
                bookData &&
                bookData.length > 0 &&
                fullLangDataMap
            ) {
                const countryMap = new Map<string, ICountryGridRowData>();

                countryIdMap.forEach((name, code) => {
                    const rowData: ICountryGridRowData = {
                        name: name,
                        code: code,
                        knownLanguageCount: 0,
                        knownLanguageTags: [],
                        blorgLanguageCount: 0,
                        blorgLanguageTags: [],
                        bookCount: 0,
                    };
                    countryMap.set(code, rowData);
                });
                const unknownRegions: string[] = [];
                // Add languages to each country row.
                fullLangDataMap.forEach((lang) => {
                    if (lang.region) {
                        const rowData = countryMap.get(lang.region);
                        if (!rowData) {
                            if (!unknownRegions.includes(lang.region)) {
                                unknownRegions.push(lang.region);
                            }
                        } else {
                            if (!rowData.knownLanguageTags.includes(lang.tag)) {
                                rowData.knownLanguageTags.push(lang.tag);
                                rowData.knownLanguageCount =
                                    rowData.knownLanguageTags.length;
                            }
                            // For the moment, we're not including the regions field from langtags.
                            // // REVIEW: Should the other regions be included in the counts?
                            // // If so, the US has 715 known languages.  If not, then English
                            // // (en) is not counted as a known language for the UK.
                            // if (lang.regions) {
                            //     lang.regions.forEach((r) => {
                            //         if (r === lang.region) return; // I don't think this should happen.
                            //         const rowData2 = countryMap.get(r);
                            //         if (rowData2) {
                            //             if (
                            //                 !rowData2.knownLanguageTags.includes(
                            //                     lang.tag
                            //                 )
                            //             ) {
                            //                 rowData2.knownLanguageTags.push(
                            //                     lang.tag
                            //                 );
                            //                 rowData2.knownLanguageCount =
                            //                     rowData2.knownLanguageTags.length;
                            //             }
                            //         } else {
                            //             if (!unknownRegions.includes(r)) {
                            //                 unknownRegions.push(r);
                            //             }
                            //         }
                            //     });
                            // }
                        }
                    }
                });
                // console.log(
                //     "Unrecognized regions from langtags: ",
                //     unknownRegions.sort()
                // );
                bookData.forEach((book) => {
                    // Keep track of the regions represented by the
                    // languages in this book so that we can count
                    // the books for each region accurately even with
                    // multiple languages from the same region.
                    const bookRegions: string[] = [];

                    book.languages.forEach((langTag) => {
                        let lang = fullLangDataMap.get(langTag);
                        if (!lang) {
                            lang = getLangTagDataForIrregularLangCode(
                                langTag,
                                fullLangDataMap,
                                countryIdMap
                            );
                        }
                        if (lang && lang.region) {
                            if (!bookRegions.includes(lang.region)) {
                                bookRegions.push(lang.region);
                            }
                            const rowData = countryMap.get(lang.region);
                            if (rowData) {
                                if (
                                    !rowData.blorgLanguageTags.includes(
                                        lang.tag
                                    )
                                ) {
                                    rowData.blorgLanguageTags.push(lang.tag);
                                    rowData.blorgLanguageCount =
                                        rowData.blorgLanguageTags.length;
                                }
                                // For the moment, we're not including the regions field from langtags.
                                // // REVIEW: Should the other regions be included in the counts?
                                // // If so, the US has 90+ languages represented in bloomlibrary.
                                // // If not, then English (en) is not counted as a language for
                                // // the UK, Canada, Australia, etc.  And the US has only 4 languages.
                                // if (lang.regions) {
                                //     lang.regions.forEach((r) => {
                                //         if (r === lang.region) return; // I don't think this should happen.
                                //         const rowData2 = countryMap.get(r);
                                //         if (rowData2) {
                                //             ++rowData2.bookCount;
                                //             if (
                                //                 !rowData2.blorgLanguageTags.includes(
                                //                     lang.tag
                                //                 )
                                //             ) {
                                //                 rowData2.blorgLanguageTags.push(
                                //                     lang.tag
                                //                 );
                                //                 rowData2.blorgLanguageCount =
                                //                     rowData2.blorgLanguageTags.length;
                                //             }
                                //         }
                                //     });
                                // }
                            }
                        }
                    });
                    bookRegions.forEach((region) => {
                        const rowData = countryMap.get(region);
                        if (rowData) {
                            ++rowData.bookCount;
                        }
                    });
                });

                const allRows: ICountryGridRowData[] = Array.from(
                    countryMap.values()
                )
                    .filter((x) => x.bookCount > 0)
                    .sort((a, b) => b.bookCount - a.bookCount); // default sort by book count descending
                if (allRows.length !== countryDataRows.length) {
                    setCountryDataRows(allRows);
                    setTotalRowCount(allRows.length);
                }
            }
        }, [
            languages,
            bookData,
            countryDataRows.length,
            fullLangDataMap,
            gridFilters,
            countryIdMap,
        ]);

        const kRowsPerGridPage = 20;
        const [onePageofMatchingLangs, setOnePageOfMatchingLangs] = useState<
            ICountryGridRowData[]
        >([]);
        const [gridPage, setGridPage] = useState(0);
        // The columns this user may see; drives the grid's rendered column set.
        const columns = visibleColumnDefinitions;

        // Apply filtering and sorting to the rows, then set the page of rows to display.
        // Also set the total row count and the export data.
        useEffect(() => {
            adjustListDisplaysForFiltering(
                countryGridColumnDefinitions,
                gridFilters
            );
            const filteredRows = countryDataRows.filter((row) =>
                filterCountryGridRow(row, gridFilters)
            );
            const sortedRows = filteredRows.sort((a, b) =>
                compareCountryGridRows(a, b, sortings)
            );
            if (sortedRows.length < gridPage * kRowsPerGridPage) {
                setGridPage(0);
            }
            setTotalRowCount(sortedRows.length);
            if (setExportData) setExportData(sortedRows);
            const rows = sortedRows.slice(
                gridPage * kRowsPerGridPage,
                (gridPage + 1) * kRowsPerGridPage
            );
            setOnePageOfMatchingLangs(rows);
        }, [
            countryDataRows,
            gridPage,
            sortings,
            countryGridColumnDefinitions,
            gridFilters,
            setExportData,
        ]);

        if (props.setExportColumnInfo) {
            props.setExportColumnInfo(
                columnNamesInDisplayOrder.filter((cn) =>
                    // `columns` correctly only includes those columns the user has access to
                    // (e.g. it might filter out `uploader` if the user is not logged in as a moderator).
                    // So we want to be sure we are not including anything not in `columns` in the export.
                    columns.map((c) => c.name).includes(cn)
                ),
                hiddenColumnNames
            );
        }

        // note: this is an embedded function as a way to get at countryGridColumnDefinitions. It's important
        // that we don't reconstruct it on every render, or else we'll lose cursor focus on each key press.
        // Alternatives to this useMemo would include a ContextProvider, a higher-order function, or just
        // making countryGridColumnDefinitions static in this file.
        const FilteringComponentForOneColumn: React.FunctionComponent<TableFilterRow.CellProps> = useMemo(
            () => (fprops) => {
                const columnDef = countryGridColumnDefinitions.find(
                    (c) => c.name === fprops.column.name
                );
                if (columnDef) {
                    return <TableFilterRow.Cell {...fprops} />;
                }
                //  hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
                return <TableCell />;
            },
            [countryGridColumnDefinitions]
        );

        return (
            <div>
                <Grid rows={onePageofMatchingLangs} columns={columns}>
                    <PagingState
                        currentPage={gridPage}
                        onCurrentPageChange={setGridPage}
                        pageSize={kRowsPerGridPage}
                    />

                    <FilteringState
                        filters={gridFilters}
                        onFiltersChange={(x) => {
                            setGridFilters(x);
                        }}
                    />

                    <SortingState
                        sorting={sortings}
                        onSortingChange={(sorting) => {
                            setSortings(sorting);
                        }}
                        columnExtensions={countryGridColumnDefinitions.map(
                            (c: IGridColumn) => ({
                                columnName: c.name,
                                sortingEnabled: !!c.sortingEnabled,
                            })
                        )}
                    />
                    <CustomPaging totalCount={totalRowCount} />
                    <DragDropProvider />
                    <Table />
                    <TableColumnReordering
                        order={columnNamesInDisplayOrder}
                        onOrderChange={setColumnNamesInDisplayOrder}
                    />
                    <TableColumnResizing
                        resizingMode={"nextColumn"}
                        columnWidths={columnWidths}
                        onColumnWidthsChange={setColumnWidths}
                    />
                    <TableHeaderRow showSortingControls />

                    <TableColumnVisibility
                        hiddenColumnNames={hiddenColumnNames}
                        onHiddenColumnNamesChange={(names) =>
                            setHiddenColumnNames(names)
                        }
                    />
                    <TableFilterRow
                        cellComponent={FilteringComponentForOneColumn}
                    />
                    <Toolbar />
                    {ModeratorStatusToolbarPlugin(theme, user, resetView)}
                    <ColumnChooser />
                    <PagingPanel />
                </Grid>
            </div>
        );
    }
);

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default CountryGridControlInternal;
