// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import titleCase from "title-case";
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
    CustomPaging,
    Filter as GridFilter
} from "@devexpress/dx-react-grid";
import { Book } from "../../model/Book";
import { Checkbox, TableCell, Link } from "@material-ui/core";
import { TagsList } from "../Admin/TagsList";
import { IFilter } from "../../IFilter";

const kColumnsWeCantFilter = [
    "title",
    "incoming",
    "createdAt",
    "pagCount",
    "languages"
];
const GridPage: React.FunctionComponent<{}> = props => {
    const kBooksPerGridPage = 20;
    const router = useContext(RouterContext);
    const [gridFilters, setGridFilters] = useState<GridFilter[]>([]);
    const [gridPage, setGridPage] = useState(0);

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

    const defaultHiddenColumnNames = [
        "pageCount",
        "license",
        "harvestState",
        "tags",
        "createdAt"
    ];
    //console.log("books " + books.length);
    return (
        <div>
            <Grid
                rows={books}
                columns={[
                    {
                        name: "title",
                        title: "Title",
                        getCellValue: (b: Book) => (
                            <Link
                                href={`/?bookId=${b.id}&pageType=book-detail&title=${b.title}`}
                                color="secondary"
                                target="_blank"
                            >
                                {b.title}
                            </Link>
                        )
                    },
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
                        name: "bookshelves",
                        title: "Bookshelves",
                        getCellValue: (b: Book) =>
                            b.tags
                                .filter(t => t.startsWith("bookshelf:"))
                                .map(t => t.replace(/bookshelf:/, ""))
                                .join(", ")
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

                <FilteringState
                    defaultFilters={[]}
                    onFiltersChange={setGridFilters}
                    columnExtensions={kColumnsWeCantFilter.map(n => ({
                        columnName: n,
                        filteringEnabled: false
                    }))}
                />

                <SortingState defaultSorting={[]} />
                <IntegratedSorting />
                <CustomPaging totalCount={totalBookMatchingFilter} />
                {/* <IntegratedFiltering /> */}
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

// used to hide filter UI if we don't support filtering; the default ui, inexplicably, just shows it greyed out
function FilterCell(props: TableFilterRow.CellProps) {
    if (kColumnsWeCantFilter.indexOf(props.column.name) > -1) {
        // empty
        return <TableCell />;
    }
    // return the default UI
    return <TableFilterRow.Cell {...props} />;
}
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
                console.error(`Cannot yet filter on ${g.columnName}`);
        }
    });
    return f;
}

export default GridPage;
