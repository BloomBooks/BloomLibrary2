import { css } from "@emotion/react";

import React, {
    useState,
    useEffect,
    useMemo,
    ReactText,
    useContext,
} from "react";

import {
    Plugin,
    Template,
    TemplatePlaceholder,
} from "@devexpress/dx-react-core";

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
    TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";
import {
    useGetBookCount,
    useGetBooksForGrid,
    useProcessDerivativeFilter,
} from "../../connection/LibraryQueryHooks";

import {
    FilteringState,
    SortingState,
    PagingState,
    CustomPaging,
    Filter as GridFilter,
    RowDetailState,
    Sorting,
} from "@devexpress/dx-react-grid";
import { TableCell, useTheme } from "@material-ui/core";
import { IFilter, BooleanOptions } from "../../IFilter";
import { getBookGridColumnsDefinitions, IGridColumn } from "./GridColumns";

import { useStorageState } from "react-storage-hooks";
import { Book } from "../../model/Book";
import StaffPanel from "../Admin/StaffPanel";
import { useGetLoggedInUser, User } from "../../connection/LoggedInUser";
import { observer } from "mobx-react-lite";
import { IGridControlProps } from "./GridControl";
import { CachedTablesContext } from "../../model/CacheProvider";
import { ILanguage } from "../../model/Language";
import matchSorter from "match-sorter";
import { useGetCollection } from "../../model/Collections";

// we need the observer in order to get the logged in user, which may not be immediately available
const GridControlInternal: React.FunctionComponent<IGridControlProps> = observer(
    (props) => {
        const theme = useTheme();
        const { languagesByBookCount: languages } = useContext(
            CachedTablesContext
        );
        const user = useGetLoggedInUser();
        const kBooksPerGridPage = 20;
        const [gridFilters, setGridFilters] = useState<GridFilter[]>(
            props.initialGridFilters || []
        );
        const [gridPage, setGridPage] = useState(0);
        const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);
        const [sortings, setSortings] = useState<ReadonlyArray<Sorting>>([]);
        const [bookGridColumnDefinitions] = useState(
            getBookGridColumnsDefinitions()
        );
        const [expandedRowIds, setExpandedRowIds] = useState<ReactText[]>([]);
        const [
            columnNamesInDisplayOrder,
            setColumnNamesInDisplayOrder,
        ] = useStorageState<string[]>(
            localStorage,
            "book-grid-column-order",
            bookGridColumnDefinitions.map((c) => c.name)
        );
        // when a new version adds a new column, the list of columns in order will not match
        // the full list of columns. Instead of coping with this, the devexpress grid just locks down the new
        // column as the first one. So here we detect added and removed columns, while preserving order.
        useEffect(() => {
            const newCompleteSetInDefaultOrder = bookGridColumnDefinitions.map(
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
            bookGridColumnDefinitions,
        ]);

        const [hiddenColumnNames, setHiddenColumnNames] = useStorageState<
            string[]
        >(
            localStorage,
            "book-grid-column-hidden",
            bookGridColumnDefinitions
                .filter((c) => !c.defaultVisible)
                .map((c) => c.name)
        );

        // enhance: make the date nice (remove Hour/Minute/Seconds, show as YYYY-MM-DD)
        // enhance: add "in circulation" column

        const defaultColumnWidths = useMemo(
            () =>
                bookGridColumnDefinitions.map((c) => ({
                    columnName: c.name,
                    width: "auto",
                })),
            [bookGridColumnDefinitions]
        );
        const filterMadeFromPageSearchPlusColumnFilters = CombineGridAndSearchBoxFilter(
            bookGridColumnDefinitions,
            gridFilters,
            props.contextFilter || {},
            languages,
            user
        );

        if (props.setCurrentFilter) {
            props.setCurrentFilter(
                filterMadeFromPageSearchPlusColumnFilters,
                gridFilters
            );
        }
        if (props.setExportData) {
            props.setExportData(
                columnNamesInDisplayOrder.filter((cn) =>
                    // `columns` correctly only includes those columns the user has access to
                    // (e.g. it might filter out `uploader` if the user is not logged in as a moderator).
                    // So we want to be sure we are not including anything not in `columns` in the export.
                    columns.map((c) => c.name).includes(cn)
                ),
                hiddenColumnNames,
                sortings.map((s) => ({
                    columnName: s.columnName,
                    descending: s.direction === "desc",
                }))
            );
        }

        const totalBookMatchingFilter = useGetBookCount(
            filterMadeFromPageSearchPlusColumnFilters || {}
        );

        const {
            onePageOfMatchingBooks,
            totalMatchingBooksCount,
        } = useGetBooksForGrid(
            filterMadeFromPageSearchPlusColumnFilters,
            sortings.map((s) => ({
                columnName: s.columnName,
                descending: s.direction === "desc",
            })),
            gridPage * kBooksPerGridPage,
            kBooksPerGridPage
        );
        const thisIsAModerator = user?.moderator;
        useEffect(() => {
            setColumns(
                bookGridColumnDefinitions.filter(
                    // some columns we include only if we are logged in, or
                    // logged in with the right permissions
                    (col) =>
                        user?.moderator ||
                        (!col.moderatorOnly && !col.loggedInOnly) ||
                        (!col.moderatorOnly && col.loggedInOnly && user)
                )
            );
            //setColumnNamesInDisplayOrder(bookGridColumns.map(c => c.name));
            // todo? useEffect used to depend on router, though doesn't obviously use it.
        }, [user, thisIsAModerator, bookGridColumnDefinitions]);

        // note: this is an embedded function as a way to get at bookGridColumnDefinitions. It's important
        // that we don't reconstruct it on every render, or else we'll lose cursor focus on each key press.
        // Alternatives to this useMemo would include a ContextProvider, a higher-order function, or just
        // making bookGridColumnDefinitions static in this file. We're using this one at the moment because
        // we eventually will reuse this for different grids, with different column definitions.
        const FilteringComponentForOneColumn: React.FunctionComponent<TableFilterRow.CellProps> = useMemo(
            () => (fprops) => {
                const columnDef = bookGridColumnDefinitions.find(
                    (c) => c.name === fprops.column.name && c.addToFilter
                );
                if (columnDef) {
                    if (columnDef.getCustomFilterComponent) {
                        return columnDef.getCustomFilterComponent!(fprops);
                    }
                    //return the default UI
                    return <TableFilterRow.Cell {...fprops} />;
                }
                //  hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
                return <TableCell />;
            },
            [bookGridColumnDefinitions]
        );

        const StatusToolbarPlugin = () => (
            <Plugin name="ShowMatchingBookCount">
                <Template name="toolbarContent">
                    <span>{`${totalMatchingBooksCount} Matching Books`}</span>
                    {
                        // As far as I can tell, this lint error is just wrong.
                        // eslint-disable-next-line react/prop-types
                        props.showFilterSpec && (
                            <span
                                css={css`
                                    margin-left: 20px;
                                    margin-right: 5px;
                                    color: #007aff;
                                `}
                            >
                                {`Filter: ${JSON.stringify(
                                    filterMadeFromPageSearchPlusColumnFilters
                                )}`}
                            </span>
                        )
                    }
                    <span
                        css={css`
                            margin-left: 20px;
                            margin-right: 5px;
                            color: ${theme.palette.primary.main};
                        `}
                    >
                        {user && `${user.moderator ? "Moderator" : ""}`}
                    </span>
                    <TemplatePlaceholder />
                </Template>
            </Plugin>
        );

        return (
            <div>
                <Grid rows={onePageOfMatchingBooks} columns={columns}>
                    <PagingState
                        currentPage={gridPage}
                        onCurrentPageChange={setGridPage}
                        pageSize={kBooksPerGridPage}
                    />

                    <FilteringState
                        defaultFilters={gridFilters}
                        onFiltersChange={(x) => {
                            // if (props.setCurrentFilter) {
                            //     props.setCurrentFilter(
                            //         CombineGridAndSearchBoxFilter(
                            //             bookGridColumnDefinitions,
                            //             x,
                            //             router!.current.filter
                            //         )
                            //     );
                            // }

                            setGridPage(0);
                            setGridFilters(x);
                        }}
                    />

                    <SortingState
                        defaultSorting={[]}
                        onSortingChange={(sorting) => {
                            setSortings(sorting);
                        }}
                        columnExtensions={bookGridColumnDefinitions.map(
                            (c: IGridColumn) => ({
                                columnName: c.name,
                                sortingEnabled: !!c.sortingEnabled,
                            })
                        )}
                    />
                    {/* <IntegratedSorting /> */}
                    <CustomPaging totalCount={totalBookMatchingFilter} />
                    <DragDropProvider />
                    <RowDetailState
                        expandedRowIds={expandedRowIds}
                        onExpandedRowIdsChange={setExpandedRowIds}
                    />
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

                    {user && user.moderator && (
                        <TableRowDetail
                            contentComponent={(row) => {
                                const book: Book = row.row;
                                return (
                                    <div
                                        css={css`
                                            //background-color: #1a818f38;
                                        `}
                                    >
                                        <StaffPanel book={book}></StaffPanel>
                                    </div>
                                );
                            }}
                        />
                    )}
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
                    <StatusToolbarPlugin />
                    <ColumnChooser />
                    <PagingPanel />
                </Grid>
            </div>
        );
    }
);

// combine the search-box filter with filtering done in the columns
function CombineGridAndSearchBoxFilter(
    bookGridColumns: IGridColumn[],
    gridFilters: GridFilter[],
    routerFilter: IFilter,
    languages: ILanguage[],
    user: User | undefined
): IFilter {
    // The result of the search box is encoded. We need it decoded in order to search correctly
    // (e.g.) on things like "topic:math", where the colon would be encoded otherwise.
    let decodedFilter = routerFilter;
    // If the search box filter starts with "collection:", we need to get the named
    // collection and substitute its filter here.  This is useful because the collection
    // filter may not be expressible with our column filtering setup or with other search
    // expressions.
    let collectionName;
    if (decodedFilter.search) {
        decodedFilter.search = decodeURIComponent(decodedFilter.search);
        if (decodedFilter.search.toLowerCase().startsWith("collection:")) {
            collectionName = decodedFilter.search.substr(11);
        }
    }
    const originalDecodedFilter = decodedFilter;
    // Being a hook, useGetCollection cannot be called conditionally.  But its argument
    // can be undefined, so we can call it whether or not we have a collection specified.
    const contentfulCollect = useGetCollection(collectionName);
    if (collectionName && contentfulCollect) {
        if (contentfulCollect.collection?.filter) {
            // replace the original search filter with the desired collection filter.
            decodedFilter = contentfulCollect.collection.filter;
        }
    }
    if (!useProcessDerivativeFilter(decodedFilter)) {
        // Things are still loading: return the original search filter so that we don't
        // get an error popping up.  This will get called again as things settle down...
        decodedFilter = originalDecodedFilter;
    }

    const f: IFilter = {
        ...decodedFilter,
        inCirculation: BooleanOptions.All,
        draft: BooleanOptions.All,
    };
    gridFilters.forEach((g) => {
        // the business of contains vs. equals has not been worked out yet, on the grid ui side nor the actual query side
        if (g.operation !== "contains") {
            console.error(`Cannot yet filter using ${g.operation}`);
        }
        if (g.value) {
            const gridColumnDefinition = bookGridColumns.find(
                (c) => c.name === g.columnName
            );
            f.search = f.search || ""; // avoid getting an undefined if the filter tries to add to the existing search
            let target = g.value;
            // This is the same matching algorithm used by the language chooser on the home page;
            // but here, we just choose the first matching language to match on.
            // It would be nice to put this special case into the column definition, but
            // I don't see how, as the column creating code doesn't have access to the
            // languages collection.
            if (gridColumnDefinition?.name === "languages" && target) {
                const matchingLanguages = matchSorter(languages, target, {
                    keys: ["englishName", "name", "isoCode"],
                });
                target =
                    matchingLanguages.length > 0
                        ? matchingLanguages[0].isoCode
                        : target; // will result in 'no data'
            }
            if (target) {
                gridColumnDefinition!.addToFilter!(f, target);
            }
        }
    });
    // only moderators or uploaders can see draft (or out-of-circulation)
    // books (BL-12973)
    if (!user) {
        // if we don't know who the user is, we assume they are not a moderator
        f.draft = BooleanOptions.No;
        f.inCirculation = BooleanOptions.Yes;
    } else if (!user.moderator) {
        // if the user is not a moderator, allow draft (or out-of-circulation)
        // books only if they are the uploader
        f.anyOfThese = f.anyOfThese || [];
        f.anyOfThese.push({
            draft: BooleanOptions.No,
            inCirculation: BooleanOptions.Yes,
        });
        f.anyOfThese.push({
            search: `uploader:${user.email}`,
            draft: BooleanOptions.All,
            inCirculation: BooleanOptions.All,
        });
    }
    return f;
}

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default GridControlInternal;
