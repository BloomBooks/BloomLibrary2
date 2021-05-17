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
import { IGridColumn } from "../Grid/GridColumns";
import { useIntl } from "react-intl";

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
        blorgLink: `https://bloomlibrary.org/pratham/root.read/book/${book.objectId}`,
        startedCount: parseInt(book.stats?.startedCount, 10) || 0,
        downloads:
            (parseInt(book.stats?.shellDownloads, 10) || 0) +
            (parseInt(book.stats?.pdfDownloads, 10) || 0) +
            (parseInt(book.stats?.epubDownloads, 10) || 0) +
            (parseInt(book.stats?.bloomPubDownloads, 10) || 0),
        uploadDate: JSON.stringify(book.uploadDate).substr(1, 24), // remove surrounding "" from stringify
    };
    return report;
}

export const PrathamReport: React.FunctionComponent = (props) => {
    const l10n = useIntl();
    const reportName = l10n.formatMessage({
        id: "report.pageName",
        defaultMessage: "Pratham Books Report",
    });

    useSetBrowserTabTitle(reportName);

    const kBooksPerPage = 100000;
    const query = constructPrathamBookQuery();
    let sortings: ReadonlyArray<Sorting> = [];
    const totalBookMatchingFilter = useGetBookCount(query.where);
    const { onePageOfMatchingBooks } = useGetBooksForGrid(
        query.where,
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
        { name: "languages", title: "Languages", l10nId: "report.languages" },
        {
            name: "title",
            title: "Primary Title",
            l10nId: "report.primaryTitle",
        },
        {
            name: "originalTitle",
            title: "Original Title",
            l10nId: "report.originalTitle",
        },
        {
            name: "allTitles",
            title: "All Titles-raw",
            l10nId: "report.allTitlesRaw",
        },
        {
            name: "originalPublisher",
            title: "Original Publisher",
            l10nId: "report.originalPublisher",
        },
        { name: "publisher", title: "Publisher", l10nId: "report.publisher" },
        {
            name: "blorgLink",
            title: "Blorg Link",
            l10nId: "report.blorgLink",
        },
        {
            name: "startedCount",
            title: "Reads (starts)",
            l10nId: "report.readsStarted",
        },
        {
            name: "downloads",
            title: "Downloads (combined)",
            l10nId: "report.downloadsCombined",
        },
        {
            name: "uploadDate",
            title: "Original Upload Date",
            l10nId: "report.originalUploadDate",
        },
    ];
    // localize
    columns.forEach((c) => {
        const s = l10n.formatMessage({
            id: c.l10nId ?? "report." + c.name,
            defaultMessage: c.title,
        });
        c.title = s;
    });

    return (
        <div>
            <h1>{reportName}</h1>
            <p>
                There are {totalBookMatchingFilter} books from Pratham in Bloom
                Library.
            </p>
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

function constructPrathamBookQuery() {
    const query: any = {};
    query.where = {
        $or: [
            { publisher: { $regex: "Pratham" } },
            { originalPublisher: { $regex: "Pratham" } },
        ],
    };
    return query;
}

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default PrathamReport;
