// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useMemo } from "react";
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
import { ICollectionReportProps } from "./CollectionReportSplit";
import { IGridColumn } from "../Grid/GridColumns";
import { useIntl } from "react-intl";
import { useGetCollection } from "../../model/Collections";
import { PageNotFound } from "../PageNotFound";

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

function extractBookReportFromRawData(
    book: any,
    collectionName: string
): IBookReport {
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
        blorgLink: `https://bloomlibrary.org/${collectionName}/book/${book.objectId}`,
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

export const CollectionReport: React.FunctionComponent<ICollectionReportProps> = (
    props
) => {
    const l10n = useIntl();
    const collectionNameCapitalized =
        props.collectionName[0].toUpperCase() +
        props.collectionName.substring(1);
    const reportName = l10n.formatMessage(
        {
            id: "report.pageName",
            defaultMessage: "{collectionName} Books Report",
        },
        { collectionName: collectionNameCapitalized }
    );

    const kBooksPerPage = 1000000; // effectively unlimited
    let sortings: ReadonlyArray<Sorting> = [];
    const { collection, loading } = useGetCollection(props.collectionName);
    const doNotRunQuery = loading || !collection?.filter;
    const totalBookMatchingFilter = useGetBookCount(
        collection?.filter ?? {},
        doNotRunQuery
    );
    const summaryStatement = l10n.formatMessage(
        {
            id: "report.summaryStatement",
            defaultMessage:
                "There are {totalBookCount} books on the {collectionName} Books bookshelf in Bloom Library.",
        },
        {
            totalBookCount: totalBookMatchingFilter,
            collectionName: collectionNameCapitalized,
        }
    );
    const { onePageOfMatchingBooks: matchingBooks } = useGetBooksForGrid(
        collection?.filter ?? {},
        kBooksPerPage,
        0,
        sortings.map((s) => ({
            columnName: s.columnName,
            descending: s.direction === "desc",
        })),
        reportBookKeys,
        doNotRunQuery
    );
    const haveBooks: boolean = !!(matchingBooks && matchingBooks.length);
    let bookData: IBookReport[] = [];
    if (haveBooks) {
        bookData = matchingBooks.map((b: any) => {
            return extractBookReportFromRawData(
                b,
                props.collectionName.toLowerCase()
            );
        });
    }
    const columns: IGridColumn[] = [
        { name: "languages", title: "Languages", l10nId: "languages" },
        { name: "title", title: "Primary Title" },
        { name: "originalTitle", title: "Original Title" },
        { name: "allTitles", title: "All Titles" },
        { name: "originalPublisher", title: "Original Publisher" },
        { name: "publisher", title: "Publisher" },
        { name: "blorgLink", title: "Bloom Library Link" },
        { name: "startedCount", title: "Reads", l10nId: "stats.reads" },
        { name: "downloads", title: "Downloads", l10nId: "downloads" },
        { name: "uploadDate", title: "Original Upload Date" },
    ];
    // localize
    columns.forEach((c) => {
        const s = l10n.formatMessage({
            id: c.l10nId ?? `report.${c.name}`,
            defaultMessage: c.title,
        });
        c.title = s;
    });

    const result = useMemo(() => {
        if (loading) {
            // Typically the display of a collection fills the screen, pushing the footer off the bottom.
            // Until we have a collection, we can't make much of a guess how big its display should be,
            // but a very large guess like this prevents the footer flashing in and out of view.
            return <div style={{ height: "2000px" }}></div>;
        }
        if (!collection) {
            return <PageNotFound />;
        }
        return (
            <div>
                <h1>{reportName}</h1>
                {totalBookMatchingFilter >= 0 && <p>{summaryStatement}</p>}
                {(totalBookMatchingFilter < 0 ||
                    (!haveBooks && totalBookMatchingFilter > 0)) && (
                    <div>Loading...</div>
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
    }, [
        collection,
        loading,
        totalBookMatchingFilter,
        bookData,
        columns,
        haveBooks,
        reportName,
        summaryStatement,
    ]);
    return result;
};

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default CollectionReport;
