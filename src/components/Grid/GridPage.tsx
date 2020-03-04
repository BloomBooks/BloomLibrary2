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
    PagingPanel,
    TableColumnResizing
} from "@devexpress/dx-react-grid-material-ui";
import {
    useGetBookCount,
    useGetBooksForGrid
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
import { Book } from "../../model/Book";
import { Checkbox } from "@material-ui/core";
import { TagsList } from "../Admin/TagsList";

const GridPage: React.FunctionComponent<{}> = props => {
    const kBooksPerGridPage = 20;
    const router = useContext(RouterContext);
    const [gridPage, setGridPage] = useState(0);
    // const books = useBookQuery(
    //     {},
    //     router?.current.filter || {},
    //     kBooksPerGridPage,
    //     (gridPage * kBooksPerGridPage) as number
    // );
    const books = useGetBooksForGrid(
        router!.current.filter,
        kBooksPerGridPage,
        gridPage * kBooksPerGridPage
    );
    const totalBookMatchingFilter = useGetBookCount(
        router?.current.filter || {}
    );

    // TODO, Don't Merge while this line is here: I seem to have broken saving changes from the Staff panel. It works on dev-next, but not locally.
    //!!!!!!!!!!!!!!!!!!!!!!!!!!

    // TODO: Moving the column widths crashes

    const defaultHiddenColumnNames = ["pageCount", "license", "harvestState"];
    console.log("books " + books.length);
    return (
        <div>
            <Grid
                rows={books}
                columns={[
                    { name: "title", title: "Title" },
                    {
                        name: "languages",
                        title: "Languages",
                        getCellValue: (b: Book) =>
                            b.languages.map(l => l.name).join(", ")
                    },
                    {
                        name: "tags",
                        title: "Other Tags",
                        getCellValue: (b: Book) => (
                            <TagsList
                                book={b}
                                setModified={() => {}}
                                borderColor={"transparent"}
                            ></TagsList>
                        )
                    },
                    {
                        name: "incoming",
                        title: "Incoming",
                        getCellValue: (b: Book) => (
                            <Checkbox
                                checked={b.tags.includes("system:Incoming")}
                            />
                        )
                    },
                    {
                        name: "topic",
                        title: "Topic",
                        getCellValue: (b: Book) =>
                            b.tags
                                .filter(t => t.startsWith("topic:"))
                                .map(t => t.replace(/topic:/, ""))
                                .join(", ")
                    },
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
                <TableColumnResizing />
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
