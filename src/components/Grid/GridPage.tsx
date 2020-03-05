// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import titleCase from "title-case";
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
    TableColumnResizing
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

// we need the observer in order to get the logged in user, which may not be immediately available
const GridPage: React.FunctionComponent<{}> = props => {
    const user = useGetLoggedInUser(); //LoggedInUser.current;
    const kBooksPerGridPage = 20;
    const router = useContext(RouterContext);
    const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
    const [gridPage, setGridPage] = useState(0);
    const [columns, setColumns] = useState<ReadonlyArray<IGridColumn>>([]);

    const combinedFilter = CombineGridAndSearchBoxFilter(
        gridFilters,
        router!.current.filter
    );

    const books = useGetBooksForGrid(
        combinedFilter,
        kBooksPerGridPage,
        gridPage * kBooksPerGridPage
    );
    const totalBookMatchingFilter = useGetBookCount(combinedFilter || {});

    // TODO: Moving the column widths crashes
    // TODO: remember visible columns & column widths
    // TODO: make the date nice (remove Hour/Minute/Seconds, show as YYYY-MM-DD)

    const bookGridColumns = useMemo(() => getBookGridColumns(router!), [
        router
    ]);
    const defaultHiddenColumnNames = useMemo(
        () => bookGridColumns.filter(c => !c.defaultVisible).map(c => c.name),
        [bookGridColumns]
    );

    useEffect(() => {
        setColumns(
            bookGridColumns.filter(
                col =>
                    !col.moderatorOnly || user?.moderator || user?.administrator
            )
        );
    }, [router, user]);

    // used to hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
    const FilterCell = useMemo(
        () => (fprops: TableFilterRow.CellProps) => {
            if (
                bookGridColumns.find(
                    c => c.name === fprops.column.name && c.canFilter
                )
            ) {
                // return the default UI
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
                <Table />
                <TableColumnResizing />
                <TableHeaderRow showSortingControls />
                <TableColumnVisibility
                    defaultHiddenColumnNames={defaultHiddenColumnNames}
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
    gridFilters: GridFilter[],
    routerFilter: IFilter
): IFilter {
    //gridFilters[0].
    const f: IFilter = routerFilter || {};

    gridFilters.forEach(g => {
        if (g.operation !== "contains") {
            // or maybe it should be "equals"?
            console.error(`Cannot yet filter using ${g.operation}`);
        }
        switch (g.columnName) {
            case "bookshelves":
                f.bookshelf = g.value;
                break;
            case "topic":
                f.topic = titleCase(g.value!);
                break;
            // case "languages":
            //     f.language = g.value;
            //     break;
            default:
                // the ui should never have give then user a way to try to filter this
                alert(`Cannot yet filter on ${g.columnName}`);
        }
    });
    return f;
}

export default GridPage;
