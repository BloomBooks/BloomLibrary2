// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext, useState, useEffect, useMemo } from "react";
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
    TableColumnReordering
} from "@devexpress/dx-react-grid-material-ui";
import {
    useGetBookCount,
    useGetBooksForGrid
} from "../../connection/LibraryQueryHooks";
import { RouterContext } from "../../Router";
import {
    FilteringState,
    SortingState,
    IntegratedSorting,
    PagingState,
    CustomPaging,
    Filter as GridFilter
} from "@devexpress/dx-react-grid";
import { TableCell } from "@material-ui/core";
import { IFilter } from "../../IFilter";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { getBookGridColumns, IGridColumn } from "./GridColumns";
import { Breadcrumbs } from "../Breadcrumbs";
import { useStorageState } from "react-storage-hooks";

// we need the observer in order to get the logged in user, which may not be immediately available
const GridPage: React.FunctionComponent<{}> = props => {
    const user = useGetLoggedInUser(); //LoggedInUser.current;
    const kBooksPerGridPage = 20;
    const router = useContext(RouterContext);
    const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
    const [gridPage, setGridPage] = useState(0);
    const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);
    const bookGridColumns = useMemo(() => getBookGridColumns(router!), [
        router
    ]);
    const [
        columnNamesInDisplayOrder,
        setColumnNamesInDisplayOrder
    ] = useStorageState<string[]>(
        localStorage,
        "book-grid-column-order",
        bookGridColumns.map(c => c.name)
    );

    const [hiddenColumnNames, setHiddenColumnNames] = useStorageState<string[]>(
        localStorage,
        "book-grid-column-hidden",
        bookGridColumns.filter(c => !c.defaultVisible).map(c => c.name)
    );

    // enhance: make the date nice (remove Hour/Minute/Seconds, show as YYYY-MM-DD)
    // enhance: make changing checkboxes work
    // enhance: expand details of a row to show staff panel
    // enhance: add "in circulation" column

    const defaultColumnWidths = useMemo(
        () => bookGridColumns.map(c => ({ columnName: c.name, width: "auto" })),
        [bookGridColumns]
    );
    const filterMadeFromPageSearchPlusColumnFilters = CombineGridAndSearchBoxFilter(
        bookGridColumns,
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
            bookGridColumns.filter(
                // some columns we only include if we are logged in with the right permissions
                col =>
                    !col.moderatorOnly || user?.moderator || user?.administrator
            )
        );
        //setColumnNamesInDisplayOrder(bookGridColumns.map(c => c.name));
    }, [router, user, bookGridColumns]);

    // used to hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
    const FilterCell = useMemo(
        () => (fprops: TableFilterRow.CellProps) => {
            // : React.ComponentType<TableFilterRowBase.CellProps> => {
            const columnDef = bookGridColumns.find(
                c => c.name === fprops.column.name && c.addToFilter
            );
            if (columnDef) {
                // if (columnDef.getFilterComponent) {
                //     return columnDef.getFilterComponent!(fprops);
                // }
                //return the default UI
                return <TableFilterRow.Cell {...fprops} />;
            }
            // empty
            return <TableCell />;
        },
        [bookGridColumns]
    );
    return (
        <div>
            <div
                css={css`
                    margin-left: 22px;
                `}
            >
                <Breadcrumbs />
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
                    onHiddenColumnNamesChange={names =>
                        setHiddenColumnNames(names)
                    }
                />
                <TableFilterRow cellComponent={FilterCell} />
                <Toolbar />
                <ColumnChooser />
                <PagingPanel />
            </Grid>
        </div>
    );
};

// combine the search-box filter with filtering done in the columns
function CombineGridAndSearchBoxFilter(
    bookGridColumns: IGridColumn[],
    gridFilters: GridFilter[],
    routerFilter: IFilter
): IFilter {
    const f: IFilter = routerFilter || {};
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
