// // this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
// import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
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
    Filter as GridFilter,
    Sorting,
} from "@devexpress/dx-react-grid";
import { TableCell, useTheme } from "@material-ui/core";
import {
    ILanguageGridRowData,
    filterBooksBeforeCreatingLanguageGridRows,
    getLanguageGridColumnsDefinitions,
    compareLanguageGridRows,
    filterLanguageGridRow,
    adjustListDisplaysForFiltering,
} from "./LanguageGridColumns";
import { IGridColumn } from "../Grid/GridColumns";
import { useStorageState } from "react-storage-hooks";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { observer } from "mobx-react-lite";
import { ILanguageGridControlProps } from "./LanguageGridControl";
import { CachedTablesContext } from "../../model/CacheProvider";
import {
    CachedBookDataContext,
    fixLanguageRegionDataAndGetMap,
    ModeratorStatusToolbarPlugin,
} from "../AggregateGrid/AggregateGridPage";
import { ILangTagData } from "../AggregateGrid/AggregateGridInterfaces";

const rawLangData: ILangTagData[] = require("../AggregateGrid/reduced-langtags.json");

// we need the observer in order to get the logged in user, which may not be immediately available
const LanguageGridControlInternal: React.FunctionComponent<ILanguageGridControlProps> = observer(
    (props) => {
        const setExportData = props.setExportData;
        const theme = useTheme();
        const { languagesByBookCount: languages } = useContext(
            CachedTablesContext
        );
        const user = useGetLoggedInUser();
        const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
        const [languageGridColumnDefinitions] = useState(
            getLanguageGridColumnsDefinitions()
        );
        const { minimalBookInfo: bookData } = useContext(CachedBookDataContext);

        const [totalRowCount, setTotalRowCount] = useState(0);
        const [langDataRows, setLangDataRows] = useState<
            ILanguageGridRowData[]
        >([]);
        const fullLangDataMap = useMemo(() => {
            return fixLanguageRegionDataAndGetMap(rawLangData);
        }, []);
        const countriesMap = useMemo(() => {
            const map = new Map<string, string>();
            rawLangData.forEach((lng) => {
                if (lng.region && lng.regionname)
                    map.set(lng.region, lng.regionname);
            });
            return map;
        }, []);

        // Create langDataRows from languages and bookData.
        // fullLangDataMap and countriesMap are used to fill in some data from langtags.json.
        // Some gridFilters are applied to the bookData before creating the rows.
        useEffect(() => {
            if (
                languages &&
                bookData &&
                bookData.length > 0 &&
                fullLangDataMap &&
                countriesMap &&
                gridFilters
            ) {
                const languageRowMap = new Map<string, ILanguageGridRowData>();
                // console.log(
                //     `LanguageGridControlInternal: Language data for ${languages.length} languages`
                // );
                // console.log(
                //     `LanguageGridControlInternal: Book data for ${bookData.length} books`
                // );
                languages.forEach((lang) => {
                    const baseValue: ILanguageGridRowData = {
                        langTag: lang.isoCode,
                        exonym: lang.name,
                        endonym: lang.name,
                        bookCount: 0,
                        firstSeen: "",
                        otherNames: [],
                        uploaderCount: 0,
                        uploaderEmails: [],
                        countryName: "",
                        level1Count: 0,
                        level2Count: 0,
                        level3Count: 0,
                        level4Count: 0,
                    };
                    const langData = fullLangDataMap.get(lang.isoCode);
                    // if (!langData) {
                    //     console.log(`DEBUG: No langData for ${lang.isoCode}`);
                    // }
                    if (langData) {
                        baseValue.exonym = langData.name;
                        if (langData.names) {
                            langData.names.forEach((name) => {
                                if (
                                    name !== baseValue.exonym &&
                                    !baseValue.otherNames.includes(name)
                                )
                                    baseValue.otherNames.push(name);
                            });
                        }
                        if (langData.region) {
                            const regionName = countriesMap.get(
                                langData.region
                            );
                            if (regionName) {
                                baseValue.countryName = regionName;
                            }
                        }
                        // if we go back to allowing multiple regions per language, this code will be useful
                        // if (langData.regions) {
                        //     langData.regions.forEach((region) => {
                        //         const regionName = countriesMap.get(region);
                        //         if (
                        //             regionName &&
                        //             !baseValue.countryNames.includes(regionName)
                        //         ) {
                        //             baseValue.countryNames.push(regionName);
                        //         }
                        //     });
                        // }
                    }
                    languageRowMap.set(lang.isoCode, baseValue);
                });
                // let unknownLangCount = 0;
                bookData.forEach((book) => {
                    if (!book.lang1Tag) {
                        // ++unknownLangCount;
                        return;
                    }
                    let lang = languageRowMap.get(book.lang1Tag);
                    if (!lang) {
                        // we've tried to standardize on "th" for Thai, but there are still some "th-TH" books
                        if (book.lang1Tag === "th-TH") {
                            lang = languageRowMap.get("th");
                            // we've tried to standardize on "zh-CN" for Chinese, but there is at least one "cmn" book
                        } else if (book.lang1Tag === "cmn") {
                            lang = languageRowMap.get("zh-CN");
                        } else if (book.lang1Tag === "xkg") {
                            // I'm not sure what happened here, but we have several books with a tag of "xkg" that
                            // display the language as "kcg-x-Gworog" in the bloom library UI.  I assume that's correct.
                            lang = languageRowMap.get("kcg-x-Gworog");
                        } else if (book.lang1Tag === "fuv-Arab") {
                            // Three books claim the Arabic script, but are obviously Latin (the default) script.
                            lang = languageRowMap.get("fuv");
                            // I have no idea what this user was thinking, but the book is obviously English.
                        } else if (book.lang1Tag === "en-Dupl") {
                            lang = languageRowMap.get("en");
                        } /* else if (book.lang1Tag === "kvt") {
                            // Two books seem to have been mislabeled as a different language in Myanmar.
                            lang = map1.get("aeu");
                        }*/
                    }
                    if (lang) {
                        if (
                            !filterBooksBeforeCreatingLanguageGridRows(
                                book,
                                gridFilters
                            )
                        ) {
                            return;
                        }
                        lang.bookCount++;
                        if (lang.bookCount === 1)
                            lang.firstSeen = book.createdAt;
                        else if (book.createdAt < lang.firstSeen)
                            lang.firstSeen = book.createdAt;
                        if (book.uploader?.username) {
                            if (
                                !lang.uploaderEmails.includes(
                                    book.uploader.username
                                )
                            ) {
                                lang.uploaderCount++;
                                lang.uploaderEmails.push(
                                    book.uploader.username
                                );
                            }
                        }
                        if (book.tags) {
                            // Level tags are the most reliable way to determine the level of a book.
                            // If a book has a level tag, it is the level of the book.  Otherwise, we look for
                            // a computedLevel tag, which is calculated automatically by some algorithm.
                            const levelTag = book.tags.find((x) =>
                                x.startsWith("level:")
                            );
                            if (levelTag) {
                                switch (levelTag) {
                                    case "level:1":
                                        lang.level1Count++;
                                        break;
                                    case "level:2":
                                        lang.level2Count++;
                                        break;
                                    case "level:3":
                                        lang.level3Count++;
                                        break;
                                    case "level:4":
                                        lang.level4Count++;
                                        break;
                                }
                            } else {
                                const computedTag = book.tags.find((x) =>
                                    x.startsWith("computedLevel:")
                                );
                                if (computedTag) {
                                    switch (computedTag) {
                                        case "computedLevel:1":
                                            lang.level1Count++;
                                            break;
                                        case "computedLevel:2":
                                            lang.level2Count++;
                                            break;
                                        case "computedLevel:3":
                                            lang.level3Count++;
                                            break;
                                        case "computedLevel:4":
                                            lang.level4Count++;
                                            break;
                                    }
                                }
                            }
                        }
                    } else if (book.lang1Tag) {
                        // console.warn(
                        //     `LanguageGridControlInternal: Book ${book.objectId} data for unknown language ${book.lang1Tag}`
                        // );
                    } else {
                        // ++unknownLangCount;
                    }
                });
                // console.warn(
                //     `LanguageGridControlInternal: ${unknownLangCount} books with undetermined primary language`
                // );
                const allRows: ILanguageGridRowData[] = Array.from(
                    languageRowMap.values()
                )
                    .filter((x) => x.bookCount > 0)
                    .sort((a, b) => b.bookCount - a.bookCount); // sort by book count descending
                if (allRows.length !== langDataRows.length) {
                    setLangDataRows(allRows);
                    setTotalRowCount(allRows.length);
                }
            }
        }, [
            languages,
            bookData,
            langDataRows.length,
            fullLangDataMap,
            gridFilters,
            countriesMap,
        ]);

        const kRowsPerGridPage = 20;
        const [onePageofMatchingLangs, setOnePageOfMatchingLangs] = useState<
            ILanguageGridRowData[]
        >([]);
        const [gridPage, setGridPage] = useState(0);
        const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);
        const [sortings, setSortings] = useState<ReadonlyArray<Sorting>>([]);
        const [
            columnNamesInDisplayOrder,
            setColumnNamesInDisplayOrder,
        ] = useStorageState<string[]>(
            localStorage,
            "language-grid-column-order",
            languageGridColumnDefinitions.map((c) => c.name)
        );

        // when a new version adds a new column, the list of columns in order will not match
        // the full list of columns. Instead of coping with this, the devexpress grid just locks down the new
        // column as the first one. So here we detect added and removed columns, while preserving order.
        useEffect(() => {
            const newCompleteSetInDefaultOrder = languageGridColumnDefinitions.map(
                (c) => c.name
            );
            const columnsThatNeedToBeAdded = newCompleteSetInDefaultOrder.filter(
                (x) => !columnNamesInDisplayOrder.includes(x)
            );
            const columnsThatNeedToBeRemoved = columnNamesInDisplayOrder.filter(
                (x) => !newCompleteSetInDefaultOrder.includes(x)
            );
            if (
                columnsThatNeedToBeAdded.length ||
                columnsThatNeedToBeRemoved.length
            ) {
                const oldOrderWithNewOnesAtEnd = columnNamesInDisplayOrder.concat(
                    columnsThatNeedToBeAdded
                );
                const columnsWithAnyOldOnesRemoved = oldOrderWithNewOnesAtEnd.filter(
                    (n) => !columnsThatNeedToBeRemoved.includes(n)
                );
                setColumnNamesInDisplayOrder(columnsWithAnyOldOnesRemoved);
            }
        }, [
            columnNamesInDisplayOrder,
            setColumnNamesInDisplayOrder,
            languageGridColumnDefinitions,
        ]);

        // Apply filtering and sorting to the rows, then set the page of rows to display.
        // Also set the total row count and the export data.
        useEffect(() => {
            adjustListDisplaysForFiltering(
                languageGridColumnDefinitions,
                gridFilters
            );
            const filteredRows = langDataRows.filter((row) =>
                filterLanguageGridRow(row, gridFilters)
            );
            const sortedRows = filteredRows.sort((a, b) =>
                compareLanguageGridRows(a, b, sortings)
            );
            if (sortedRows.length < gridPage * kRowsPerGridPage) {
                setGridPage(0);
            }
            setTotalRowCount(sortedRows.length);
            if (setExportData) {
                setExportData(sortedRows);
            }
            const rows = sortedRows.slice(
                gridPage * kRowsPerGridPage,
                (gridPage + 1) * kRowsPerGridPage
            );
            setOnePageOfMatchingLangs(rows);
        }, [
            langDataRows,
            gridPage,
            sortings,
            languageGridColumnDefinitions,
            gridFilters,
            setExportData,
        ]);

        const [hiddenColumnNames, setHiddenColumnNames] = useStorageState<
            string[]
        >(
            localStorage,
            "language-grid-column-hidden",
            languageGridColumnDefinitions
                .filter((c) => !c.defaultVisible)
                .map((c) => c.name)
        );

        const defaultColumnWidths = useMemo(
            () =>
                languageGridColumnDefinitions.map((c) => ({
                    columnName: c.name,
                    width: "auto",
                })),
            [languageGridColumnDefinitions]
        );

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

        const thisIsAModerator = user?.moderator;
        useEffect(() => {
            setColumns(
                languageGridColumnDefinitions.filter(
                    // some columns we include only if we are logged in, or
                    // logged in with the right permissions
                    (col) =>
                        thisIsAModerator ||
                        (!col.moderatorOnly && !col.loggedInOnly) ||
                        (!col.moderatorOnly && col.loggedInOnly && user)
                )
            );
            // todo? useEffect used to depend on router, though doesn't obviously use it.
        }, [user, thisIsAModerator, languageGridColumnDefinitions]);

        // note: this is an embedded function as a way to get at languageGridColumnDefinitions. It's important
        // that we don't reconstruct it on every render, or else we'll lose cursor focus on each key press.
        // Alternatives to this useMemo would include a ContextProvider, a higher-order function, or just
        // making languageGridColumnDefinitions static in this file. We're using this one at the moment because
        // we eventually will reuse this for different grids, with different column definitions.
        const FilteringComponentForOneColumn: React.FunctionComponent<TableFilterRow.CellProps> = useMemo(
            () => (fprops) => {
                const columnDef = languageGridColumnDefinitions.find(
                    (c) => c.name === fprops.column.name
                );
                if (columnDef) {
                    return <TableFilterRow.Cell {...fprops} />;
                }
                //  hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
                return <TableCell />;
            },
            [languageGridColumnDefinitions]
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
                        defaultFilters={gridFilters}
                        onFiltersChange={(x) => {
                            setGridFilters(x);
                        }}
                    />

                    <SortingState
                        defaultSorting={[]}
                        onSortingChange={(sorting) => {
                            setSortings(sorting);
                        }}
                        columnExtensions={languageGridColumnDefinitions.map(
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
                        defaultColumnWidths={defaultColumnWidths}
                    />
                    <TableHeaderRow showSortingControls />

                    <TableColumnVisibility
                        defaultHiddenColumnNames={hiddenColumnNames}
                        onHiddenColumnNamesChange={(names) =>
                            setHiddenColumnNames(names)
                        }
                    />
                    <TableFilterRow
                        cellComponent={FilteringComponentForOneColumn}
                    />
                    <Toolbar />
                    {ModeratorStatusToolbarPlugin(theme, user)}
                    <ColumnChooser />
                    <PagingPanel />
                </Grid>
            </div>
        );
    }
);

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default LanguageGridControlInternal;
