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
    IUploaderGridData,
    filterBooksBeforeCreatingUploaderGridRows,
    compareUploaderGridRows,
    getUploaderGridColumnsDefinitions,
    filterUploaderGridRow,
    adjustListDisplaysForFiltering,
} from "./UploaderGridColumns";
import { IGridColumn } from "../Grid/GridColumns";
import { useStorageState } from "react-storage-hooks";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { observer } from "mobx-react-lite";
import { IUploaderGridControlProps } from "./UploaderGridControl";
import { CachedTablesContext } from "../../model/CacheProvider";

import {
    CachedBookDataContext,
    fixLangTagRegionDataAndGetMap,
    getLangTagDataForIrregularLangCode,
    ModeratorStatusToolbarPlugin,
} from "../AggregateGrid/AggregateGridPage";
import {
    ILangTagData,
    IBasicUserInfo,
    IMinimalBookInfo,
} from "../AggregateGrid/AggregateGridInterfaces";

const rawLangData: ILangTagData[] = require("../AggregateGrid/reduced-langtags.json");

// we need the observer in order to get the logged in user, which may not be immediately available
const UploaderGridControlInternal: React.FunctionComponent<IUploaderGridControlProps> = observer(
    (props) => {
        const setExportData = props.setExportData;
        const theme = useTheme();
        const { languagesByBookCount: languages } = useContext(
            CachedTablesContext
        );
        const user = useGetLoggedInUser();
        const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
        const [uploaderGridColumnDefinitions] = useState(
            getUploaderGridColumnsDefinitions()
        );

        const { minimalBookInfo: bookData } = useContext(CachedBookDataContext);

        const [userData, setUserData] = useState<IBasicUserInfo[]>([]);

        const [totalRowCount, setTotalRowCount] = useState(0);
        const [uploaderDataRows, setUploaderDataRows] = useState<
            IUploaderGridData[]
        >([]);
        const fullLangDataMap = useMemo(() => {
            return fixLangTagRegionDataAndGetMap(rawLangData);
        }, []);

        // extract a country name map from the language data
        // Enhance: should we use the country id data like in CountryGridControlInternal?
        // or should we change CountryGridControlInternal to use this?
        const countriesMap = useMemo(() => {
            const map = new Map<string, string>();
            rawLangData.forEach((lng) => {
                if (lng.region && lng.regionname)
                    map.set(lng.region, lng.regionname);
            });
            return map;
        }, []);

        // extract all of the unique uploaders from the book data
        useEffect(() => {
            if (bookData && bookData.length > 0) {
                const map1 = new Map<string, IBasicUserInfo>();
                bookData.forEach((item: IMinimalBookInfo) => {
                    if (item.uploader?.objectId)
                        map1.set(item.uploader.objectId, item.uploader);
                });
                setUserData(Array.from(map1.values()));
            }
        }, [bookData]);

        // Create uploaderDataRows from languages, bookData, and userData.
        // fullLangDataMap and countriesMap are used to fill in some data from langtags.json.
        // Some gridFilters are applied to the bookData before creating the rows.
        useEffect(() => {
            if (
                languages &&
                bookData &&
                bookData.length > 0 &&
                userData &&
                userData.length > 0 &&
                fullLangDataMap &&
                countriesMap
            ) {
                const userMap = new Map<string, IUploaderGridData>();
                // console.log(
                //     `UploaderGridControlInternal: Language data for ${languages.length} languages`
                // );
                // console.log(
                //     `UploaderGridControlInternal: Book data for ${bookData.length} books`
                // );
                // console.log(
                //     `UploaderGridControlInternal: User data for ${userData.length} users`
                // );
                userData.forEach((user) => {
                    const baseValue: IUploaderGridData = {
                        email: user.username,
                        bookCount: 0,
                        languages: [],
                        countryNames: [],
                        creationDate: user.createdAt,
                    };
                    userMap.set(user.username, baseValue);
                });
                bookData.forEach((book) => {
                    if (book.uploader?.username) {
                        const user = userMap.get(book.uploader.username);
                        if (user) {
                            if (
                                !filterBooksBeforeCreatingUploaderGridRows(
                                    book,
                                    gridFilters
                                )
                            )
                                return;
                            user.bookCount++;
                            book.languages.forEach((langTag) => {
                                if (!user.languages.includes(langTag)) {
                                    user.languages.push(langTag);
                                    let langData = fullLangDataMap.get(langTag);
                                    if (!langData) {
                                        langData = getLangTagDataForIrregularLangCode(
                                            langTag,
                                            fullLangDataMap,
                                            countriesMap
                                        );
                                    }
                                    if (langData && langData.region) {
                                        const countryName = countriesMap.get(
                                            langData.region
                                        );
                                        if (
                                            countryName &&
                                            !user.countryNames.includes(
                                                countryName
                                            )
                                        ) {
                                            user.countryNames.push(countryName);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });

                const allRows: IUploaderGridData[] = Array.from(
                    userMap.values()
                )
                    .filter((x) => x.bookCount > 0)
                    .sort((a, b) => b.bookCount - a.bookCount); // sort by book count descending
                if (allRows.length !== uploaderDataRows.length) {
                    setUploaderDataRows(allRows);
                    setTotalRowCount(allRows.length);
                }
            }
        }, [
            languages,
            bookData,
            uploaderDataRows.length,
            fullLangDataMap,
            gridFilters,
            countriesMap,
            userData,
        ]);
        const kRowsPerGridPage = 20;
        const [onePageofMatchingLangs, setOnePageOfMatchingLangs] = useState<
            IUploaderGridData[]
        >([]);
        const [gridPage, setGridPage] = useState(0);
        const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);
        const [sortings, setSortings] = useState<ReadonlyArray<Sorting>>([]);
        const [
            columnNamesInDisplayOrder,
            setColumnNamesInDisplayOrder,
        ] = useStorageState<string[]>(
            localStorage,
            "uploader-grid-column-order",
            uploaderGridColumnDefinitions.map((c) => c.name)
        );
        // when a new version adds a new column, the list of columns in order will not match
        // the full list of columns. Instead of coping with this, the devexpress grid just locks down the new
        // column as the first one. So here we detect added and removed columns, while preserving order.
        useEffect(() => {
            const newCompleteSetInDefaultOrder = uploaderGridColumnDefinitions.map(
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
            uploaderGridColumnDefinitions,
        ]);

        // Apply filtering and sorting to the rows, then set the page of rows to display.
        // Also set the total row count and the export data.
        useEffect(() => {
            adjustListDisplaysForFiltering(
                uploaderGridColumnDefinitions,
                gridFilters
            );
            const filteredRows = uploaderDataRows.filter((row) =>
                filterUploaderGridRow(row, gridFilters)
            );
            const sortedRows = filteredRows.sort((a, b) =>
                compareUploaderGridRows(a, b, sortings)
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
            uploaderDataRows,
            gridPage,
            sortings,
            uploaderGridColumnDefinitions,
            gridFilters,
            setExportData,
        ]);

        const [hiddenColumnNames, setHiddenColumnNames] = useStorageState<
            string[]
        >(
            localStorage,
            "uploader-grid-column-hidden",
            uploaderGridColumnDefinitions
                .filter((c) => !c.defaultVisible)
                .map((c) => c.name)
        );

        const defaultColumnWidths = useMemo(
            () =>
                uploaderGridColumnDefinitions.map((c) => ({
                    columnName: c.name,
                    width: "auto",
                })),
            [uploaderGridColumnDefinitions]
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
                uploaderGridColumnDefinitions.filter(
                    // some columns we include only if we are logged in, or
                    // logged in with the right permissions
                    (col) =>
                        thisIsAModerator ||
                        (!col.moderatorOnly && !col.loggedInOnly) ||
                        (!col.moderatorOnly && col.loggedInOnly && user)
                )
            );
            // todo? useEffect used to depend on router, though doesn't obviously use it.
        }, [user, thisIsAModerator, uploaderGridColumnDefinitions]);

        // note: this is an embedded function as a way to get at languageGridColumnDefinitions. It's important
        // that we don't reconstruct it on every render, or else we'll lose cursor focus on each key press.
        // Alternatives to this useMemo would include a ContextProvider, a higher-order function, or just
        // making languageGridColumnDefinitions static in this file. We're using this one at the moment because
        // we eventually will reuse this for different grids, with different column definitions.
        const FilteringComponentForOneColumn: React.FunctionComponent<TableFilterRow.CellProps> = useMemo(
            () => (fprops) => {
                const columnDef = uploaderGridColumnDefinitions.find(
                    (c) => c.name === fprops.column.name
                );
                if (columnDef) {
                    return <TableFilterRow.Cell {...fprops} />;
                }
                //  hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
                return <TableCell />;
            },
            [uploaderGridColumnDefinitions]
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
                        columnExtensions={uploaderGridColumnDefinitions.map(
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
export default UploaderGridControlInternal;
