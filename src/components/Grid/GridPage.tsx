// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, {
    useContext,
    useState,
    useEffect,
    useMemo,
    ReactText
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
    TableRowDetail
} from "@devexpress/dx-react-grid-material-ui";
import {
    useGetBookCount,
    useGetBooksForGrid
} from "../../connection/LibraryQueryHooks";

import {
    FilteringState,
    SortingState,
    IntegratedSorting,
    PagingState,
    CustomPaging,
    Filter as GridFilter,
    RowDetailState
} from "@devexpress/dx-react-grid";
import { RouterContext } from "../../Router";
import { TableCell } from "@material-ui/core";
import { IFilter } from "../../IFilter";
import { getBookGridColumnsDefinitions, IGridColumn } from "./GridColumns";
import { Breadcrumbs } from "../Breadcrumbs";
import { useStorageState } from "react-storage-hooks";
import { Book } from "../../model/Book";
import { StaffPanel } from "../Admin/StaffPanel";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { observer } from "mobx-react";

// we need the observer in order to get the logged in user, which may not be immediately available
const GridPage: React.FunctionComponent<{}> = observer(() => {
    const user = useGetLoggedInUser();

    const kBooksPerGridPage = 20;
    const router = useContext(RouterContext);
    const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
    const [gridPage, setGridPage] = useState(0);
    const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);
    const [bookGridColumnDefinitions] = useState(
        getBookGridColumnsDefinitions()
    );
    const [expandedRowIds, setExpandedRowIds] = useState<ReactText[]>([]);
    const [
        columnNamesInDisplayOrder,
        setColumnNamesInDisplayOrder
    ] = useStorageState<string[]>(
        localStorage,
        "book-grid-column-order",
        bookGridColumnDefinitions.map(c => c.name)
    );

    const [hiddenColumnNames, setHiddenColumnNames] = useStorageState<string[]>(
        localStorage,
        "book-grid-column-hidden",
        bookGridColumnDefinitions
            .filter(c => !c.defaultVisible)
            .map(c => c.name)
    );

    // enhance: make the date nice (remove Hour/Minute/Seconds, show as YYYY-MM-DD)
    // enhance: add "in circulation" column

    const defaultColumnWidths = useMemo(
        () =>
            bookGridColumnDefinitions.map(c => ({
                columnName: c.name,
                width: "auto"
            })),
        [bookGridColumnDefinitions]
    );
    const filterMadeFromPageSearchPlusColumnFilters = CombineGridAndSearchBoxFilter(
        bookGridColumnDefinitions,
        gridFilters,
        router!.current.filter
    );
    const totalBookMatchingFilter = useGetBookCount(
        filterMadeFromPageSearchPlusColumnFilters || {}
    );
    const books = useGetBooksForGrid(
        filterMadeFromPageSearchPlusColumnFilters,
        kBooksPerGridPage,
        gridPage * kBooksPerGridPage
    );
    useEffect(() => {
        setColumns(
            bookGridColumnDefinitions.filter(
                // some columns we only include if we are logged in with the right permissions
                col => !col.moderatorOnly || user?.moderator
            )
        );
        //setColumnNamesInDisplayOrder(bookGridColumns.map(c => c.name));
    }, [router, user, bookGridColumnDefinitions]);

    // note: this is an embedded function as a way to get at bookGridColumnDefinitions. It's important
    // that we don't reconstruct it on every render, or else we'll lose cursor focus on each key press.
    // Alternatives to this useMemo would include a ContextProvider, a higher-order function, or just
    // making bookGridColumnDefinitions static in this file. We're using this one at the moment because
    // we eventually will reuse this for different grids, with different column definitions.
    const FilteringComponentForOneColumn: React.FunctionComponent<TableFilterRow.CellProps> = useMemo(
        () => fprops => {
            const columnDef = bookGridColumnDefinitions.find(
                c => c.name === fprops.column.name && c.addToFilter
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

    return (
        <div>
            <div
                css={css`
                    margin-left: 22px;
                `}
            >
                <Breadcrumbs />
                {/* {user && `user: ${user.email} moderator:${user.moderator}`} */}
            </div>

            <Grid rows={books} columns={columns}>
                <PagingState
                    currentPage={gridPage}
                    onCurrentPageChange={setGridPage}
                    pageSize={kBooksPerGridPage}
                />

                <FilteringState
                    defaultFilters={[]}
                    onFiltersChange={setGridFilters}
                />

                <SortingState defaultSorting={[]} />
                <IntegratedSorting />
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
                        contentComponent={row => {
                            const book: Book = row.row;
                            return (
                                <div
                                    css={css`
                                        background-color: #1d94a438;
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
                    onHiddenColumnNamesChange={names =>
                        setHiddenColumnNames(names)
                    }
                />
                <TableFilterRow
                    cellComponent={FilteringComponentForOneColumn}
                />
                <Toolbar />
                <ColumnChooser />
                <PagingPanel />
            </Grid>
        </div>
    );
});

// combine the search-box filter with filtering done in the columns
function CombineGridAndSearchBoxFilter(
    bookGridColumns: IGridColumn[],
    gridFilters: GridFilter[],
    routerFilter: IFilter
): IFilter {
    const f: IFilter = { ...routerFilter };
    gridFilters.forEach(g => {
        // the business of contains vs. equals has not been worked out yet, on the grid ui side nor the actual query side
        if (g.operation !== "contains") {
            console.error(`Cannot yet filter using ${g.operation}`);
        }
        if (g.value) {
            const gridColumnDefinition = bookGridColumns.find(
                c => c.name === g.columnName
            );
            gridColumnDefinition!.addToFilter!(f, g.value);
        }
    });
    return f;
}

export default GridPage;
