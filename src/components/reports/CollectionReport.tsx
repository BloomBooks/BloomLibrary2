import { css } from "@emotion/react";

import React, { useMemo } from "react";
import { useGetBooksForGrid } from "../../connection/LibraryQueryHooks";
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
import Button from "@material-ui/core/Button";
import DownloadCsvIcon from "../../export/download-csv.svg?react";
import { useIntl } from "react-intl";
import { useGetCollection } from "../../model/Collections";
import { PageNotFound } from "../PageNotFound";
import { exportCsv, ExportDataFn } from "../../export/exportData";

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

    const kBooksPerPage = 1000000; // effectively unlimited
    const sortings: ReadonlyArray<Sorting> = [];
    const { collection, loading } = useGetCollection(props.collectionName);
    const doNotRunQuery = loading || !collection?.filter;
    const {
        onePageOfMatchingBooks: matchingBooks,
        totalMatchingBooksCount,
    } = useGetBooksForGrid(
        collection?.filter ?? {},
        sortings.map((s) => ({
            columnName: s.columnName,
            descending: s.direction === "desc",
        })),
        0,
        kBooksPerPage
    );

    const haveBooks: boolean = !!(matchingBooks && matchingBooks.length);
    const bookData = useMemo(() => {
        if (!haveBooks) return [];

        return matchingBooks.map((b: any) => {
            return extractBookReportFromRawData(
                b,
                props.collectionName.toLowerCase()
            );
        });
    }, [haveBooks, matchingBooks, props.collectionName]);

    const kLeftPaddingPx = 24;

    const result = useMemo(() => {
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

        const loadingStatement = l10n.formatMessage({
            id: "loading",
            defaultMessage: "Loading...",
        });
        if (loading) {
            return (
                <div
                    css={css`
                        padding-left: ${kLeftPaddingPx}px;
                    `}
                >
                    {loadingStatement}
                </div>
            );
        }
        if (!collection) {
            return <PageNotFound />;
        }
        const exportBookData: ExportDataFn = () => {
            const allRows: string[][] = [];
            bookData.map((entry) => {
                const row: string[] = [];
                row.push(entry.languages ?? "");
                row.push(entry.title ?? "");
                row.push(entry.originalTitle ?? "");
                row.push(entry.allTitles ?? "");
                row.push(entry.originalPublisher ?? "");
                row.push(entry.publisher ?? "");
                row.push(entry.blorgLink ?? "");
                row.push(entry.startedCount?.toString() ?? "0");
                row.push(entry.downloads?.toString() ?? "0");
                row.push(entry.uploadDate ?? "");
                allRows.push(row);
                return row;
            });
            return allRows;
        };
        // Doing this explicitly using the count we already have display much sooner
        // than using <BookCount filter=.../> and waiting for another query to round-trip.
        const summaryCount = l10n.formatMessage(
            {
                id: "bookCount",
                defaultMessage: "{count} books",
            },
            {
                count: totalMatchingBooksCount,
            }
        );
        return (
            <div>
                {totalMatchingBooksCount >= 0 && (
                    <div
                        css={css`
                            display: flex;
                            justify-content: space-between;
                        `}
                    >
                        <div
                            css={css`
                                padding-left: ${kLeftPaddingPx}px;
                            `}
                        >
                            <h1>{collection.label}</h1>
                            <p>{summaryCount}</p>
                        </div>
                        <Button
                            css={css`
                                padding-right: ${kLeftPaddingPx}px;
                            `}
                            onClick={() =>
                                exportCsv(`${collection.label}`, exportBookData)
                            }
                        >
                            <img
                                alt={l10n.formatMessage({
                                    id: "stats.download.csvIcon",
                                    defaultMessage: "download CSV",
                                })}
                                src={DownloadCsvIcon}
                            />
                        </Button>
                    </div>
                )}
                {(totalMatchingBooksCount < 0 ||
                    (!haveBooks && totalMatchingBooksCount > 0)) && (
                    <div
                        css={css`
                            padding-left: ${kLeftPaddingPx}px;
                        `}
                    >
                        {loadingStatement}
                    </div>
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
        totalMatchingBooksCount,
        bookData,
        haveBooks,
        l10n,
    ]);
    return result;
};

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default CollectionReport;
