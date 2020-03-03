// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState } from "react";
import {
    Grid,
    Table,
    TableHeaderRow,
    TableColumnVisibility,
    Toolbar,
    ColumnChooser,
    TableFilterRow,
    PagingPanel
} from "@devexpress/dx-react-grid-material-ui";
import {
    useBookQuery,
    useGetBookCount
} from "../../connection/LibraryQueryHooks";
import { RouterContext } from "../../Router";
import {
    IntegratedFiltering,
    FilteringState,
    SortingState,
    IntegratedSorting,
    PagingState,
    CustomPaging
} from "@devexpress/dx-react-grid";

const GridPage: React.FunctionComponent<{}> = props => {
    const kBooksPerGridPage = 50;
    const router = useContext(RouterContext);
    const [gridPage, setGridPage] = useState(0);
    const books = useBookQuery(
        {},
        router?.current.filter || {},
        kBooksPerGridPage,
        (gridPage * kBooksPerGridPage) as number
    );
    const totalBookMatchingFilter = useGetBookCount(
        router?.current.filter || {}
    );

    const defaultHiddenColumnNames = ["pageCount", "license", "harvestState"];
    console.log("books " + books.length);
    return (
        <div>
            <Grid
                rows={books}
                columns={[
                    { name: "title", title: "Title" },
                    { name: "harvestState" },
                    { name: "license" },
                    { name: "copyright" },
                    { name: "pageCount" },
                    { name: "createdAt" }
                ]}
            >
                <PagingState
                    currentPage={gridPage}
                    onCurrentPageChange={setGridPage}
                    pageSize={kBooksPerGridPage}
                />
                <FilteringState defaultFilters={[]} />
                <IntegratedFiltering />
                <SortingState defaultSorting={[]} />
                <IntegratedSorting />
                <CustomPaging totalCount={totalBookMatchingFilter} />
                <Table />
                <TableHeaderRow showSortingControls />
                <TableColumnVisibility
                    defaultHiddenColumnNames={defaultHiddenColumnNames}
                />
                <TableFilterRow />
                <Toolbar />
                <ColumnChooser />
                <PagingPanel />
            </Grid>
        </div>
    );
};
export default GridPage;
