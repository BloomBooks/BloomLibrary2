// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { useSetBrowserTabTitle } from "../Routes";
import {
    useGetBookCount,
    useGetBooksForGrid,
} from "../../connection/LibraryQueryHooks";
import {
    Grid,
    Table,
    TableHeaderRow,
} from "@devexpress/dx-react-grid-material-ui";
import {
    Sorting,
    SortingState,
    IntegratedSorting,
} from "@devexpress/dx-react-grid";
import { IBookshelfReportProps } from "./BookshelfReportSplit";
import { IGridColumn } from "../Grid/GridColumns";
import { useIntl } from "react-intl";
import { IFilter, InCirculationOptions } from "../../IFilter";

interface IBookReport {
    languages: string;
    title: string;
    originalTitle: string;
    allTitles: string;
    originalPublisher: string;
    publisher: string;
    blorgLink: string;
    startedCount: number;
    downloads: number;
    uploadDate: string;
}

const reportBookKeys =
    "objectId,bookInstanceId," +
    "title,allTitles,originalTitle,publisher,originalPublisher,langPointers";

function extractBookReportFromRawData(book: any): IBookReport {
    const report: IBookReport = {
        languages: book.languages
            .map((lang: any) => {
                return `${lang.name} (${lang.isoCode})`;
            })
            .join(", "),
        title: book.title,
        originalTitle: book.originalTitle,
        allTitles: book.allTitlesRaw,
        originalPublisher: book.originalPublisher,
        publisher: book.publisher,
        blorgLink: `https://bloomlibrary.org/pratham/book/${book.objectId}`,
        startedCount: parseInt(book.stats?.startedCount, 10) || 0,
        downloads:
            (parseInt(book.stats?.shellDownloads, 10) || 0) +
            (parseInt(book.stats?.pdfDownloads, 10) || 0) +
            (parseInt(book.stats?.epubDownloads, 10) || 0) +
            (parseInt(book.stats?.bloomPubDownloads, 10) || 0),
        uploadDate: book.uploadDate!.toLocaleDateString(),
    };
    return report;
}

export const BookshelfReport: React.FunctionComponent<IBookshelfReportProps> = (
    props
) => {
    const l10n = useIntl();
    const reportName = l10n.formatMessage(
        {
            id: "report.pageName",
            defaultMessage: "{bookshelfName} Books Report",
        },
        { bookshelfName: props.bookshelfName }
    );

    useSetBrowserTabTitle(reportName);

    const kBooksPerPage = 100000;
    const filter = constructBookshelfBookFilter(props.bookshelfName);
    let sortings: ReadonlyArray<Sorting> = [];
    const totalBookMatchingFilter = useGetBookCount(filter);
    const { onePageOfMatchingBooks } = useGetBooksForGrid(
        filter,
        kBooksPerPage,
        0,
        sortings.map((s) => ({
            columnName: s.columnName,
            descending: s.direction === "desc",
        })),
        reportBookKeys
    );
    const haveBooks: boolean = !!(
        onePageOfMatchingBooks && onePageOfMatchingBooks.length
    );
    let bookData: IBookReport[] = [];
    if (haveBooks) {
        bookData = onePageOfMatchingBooks.map((b: any) => {
            return extractBookReportFromRawData(b);
        });
    }
    const columns: IGridColumn[] = [
        { name: "languages", title: "Languages" },
        { name: "title", title: "Primary Title" },
        { name: "originalTitle", title: "Original Title" },
        { name: "allTitles", title: "All Titles" },
        { name: "originalPublisher", title: "Original Publisher" },
        { name: "publisher", title: "Publisher" },
        { name: "blorgLink", title: "Bloom Library Link" },
        { name: "startedCount", title: "Reads" },
        { name: "downloads", title: "Downloads" },
        { name: "uploadDate", title: "Original Upload Date" },
    ];
    // localize
    columns.forEach((c) => {
        const s = l10n.formatMessage({
            id: `report.${c.name}`,
            defaultMessage: c.title,
        });
        c.title = s;
    });

    return (
        <div>
            <h1>{reportName}</h1>
            {totalBookMatchingFilter < 0 && <div>Loading...</div>}
            {totalBookMatchingFilter >= 0 && (
                <p>
                    There are {totalBookMatchingFilter} books on the Pratham
                    Books bookshelf in Bloom Library.
                </p>
            )}
            {!haveBooks && totalBookMatchingFilter > 0 && (
                <div>Loading ...</div>
            )}
            {haveBooks && (
                <Grid rows={bookData} columns={columns}>
                    <SortingState
                        defaultSorting={[
                            { columnName: "title", direction: "asc" },
                        ]}
                    />
                    <IntegratedSorting /> <Table />
                    <TableHeaderRow />
                </Grid>
            )}
        </div>
    );
};

function constructBookshelfBookFilter(bookshelfName: string): IFilter {
    const filter: IFilter = {};
    filter.bookshelf = bookshelfName;
    filter.inCirculation = InCirculationOptions.Yes;
    return filter;
}

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default BookshelfReport;
