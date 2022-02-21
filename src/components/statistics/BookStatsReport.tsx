// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

// Report of Books and how often (and completely) each has been read.

import {
    Grid,
    TableHeaderRow,
    Table,
} from "@devexpress/dx-react-grid-material-ui";
import { SortingState, IntegratedSorting } from "@devexpress/dx-react-grid";
import { IGridColumn } from "../Grid/GridColumns";
import React, { useState, useContext } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useGetBookStats } from "./useGetBookStats";
import { useProvideDataForExport } from "../../export/exportData";
import { CachedTablesContext } from "../../model/CacheProvider";
import { getDisplayNamesFromLanguageCode } from "../../model/Language";
import { useIntl } from "react-intl";
import { StatsGridWrapper } from "./GridWrapper";

export const BookStatsReport: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const l10n = useIntl();
    const stats = useGetBookStats(props);
    useProvideDataForExport(stats, props);
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);

    if (stats) {
        for (const stat of stats) {
            const languageDisplayName = getDisplayNamesFromLanguageCode(
                stat.language,
                languages
            )?.combined;
            if (languageDisplayName) {
                stat.language = languageDisplayName;
            }
        }
    }

    const columns: IGridColumn[] = [
        { name: "title", title: "Book Title", l10nId: "bookTitle" },
        { name: "branding", title: "Branding", l10nId: "branding" },
        { name: "language", title: "Language", l10nId: "language" },
        //{ name: "extra", title: "Extra" },
        {
            name: "finishedCount",
            title: "Finished",
            l10nId: "stats.booksRead.finishedCount",
        },
        {
            name: "startedCount",
            title: "Started",
            l10nId: "stats.booksRead.startedCount",
        },
        {
            name: "shellDownloads",
            title: "Downloads for Translation",
            l10nId: "stats.booksRead.downloadsForTranslation",
        },
        {
            name: "pdfDownloads",
            title: "PDF Downloads",
            l10nId: "stats.booksRead.pdfDownloads",
        },
        {
            name: "epubDownloads",
            title: "ePUB Downloads",
            l10nId: "stats.booksRead.epubDownloads",
        },
        {
            name: "bloomPubDownloads",
            title: "bloomPUB Downloads",
            l10nId: "stats.booksRead.bloomPubDownloads",
        },
    ];
    // localize
    columns.forEach((c) => {
        const s = l10n.formatMessage({
            id: c.l10nId ?? "stats." + c.name,
            defaultMessage: c.title,
        });
        c.title = s;
    });
    // The current grid control is using an underlying HTML table, not a FlexBox or Grid.
    // The options for column widths are very limited. "Auto" simply distributes the width
    // not allocated to specific-sized columns, without regard for content. 95px is wide
    // enough for "Finished" and reduces the space allocated to these columns in most screen
    // widths, but it could be a problem for a longer localized name. There's still typically
    // a lot of white space between Language and Finished, and no smarts at all about adjusting
    // for long or short titles, branding, or language names.
    const [tableColumnExtensions] = useState([
        { columnName: "title", width: "auto" },
        { columnName: "branding", width: "auto" },
        { columnName: "language", width: "auto" },
        //{ columnName: "extra", width: "auto" },

        // I'd like to make these columns just wide enough to show their labels,
        // with wrapping. The grid is implemented with tables, however, and they
        // don't have that sort of smarts. This is enough for the Spanish labels,
        // which are wider than English.
        { columnName: "finishedCount", width: "130px", align: "right" },
        { columnName: "startedCount", width: "130px", align: "right" },

        // Have to include these to get the alignment set to right
        { columnName: "shellDownloads", align: "right" },
        { columnName: "pdfDownloads", align: "right" },
        { columnName: "epubDownloads", align: "right" },
        { columnName: "bloomPubDownloads", align: "right" },
    ] as Table.ColumnExtension[]);

    // This table might not need this...no column headers need wrapping?
    const CustomTableHeaderCell = (cellProps: any) => {
        const style = cellProps.style || {};
        style.fontWeight = "bold";
        const adjustedProps = { ...cellProps, style };
        return (
            <TableHeaderRow.Cell
                {...adjustedProps}
                css={css`
                    white-space: normal !important;
                `}
            />
        );
    };

    // Configure numeric sorts for the last two columns (so 453 is not less than 5)
    const [integratedSortingColumnExtensions] = useState([
        { columnName: "finishedCount" },
        { columnName: "startedCount" },
    ]);

    return (
        <StatsGridWrapper stats={stats}>
            <Grid rows={stats!} columns={columns}>
                <SortingState
                    defaultSorting={[{ columnName: "title", direction: "asc" }]}
                />
                <IntegratedSorting
                    columnExtensions={integratedSortingColumnExtensions}
                />
                <Table
                    columnExtensions={tableColumnExtensions}
                    //cellComponent={CustomTableCell}
                />
                <TableHeaderRow
                    cellComponent={CustomTableHeaderCell}
                    showSortingControls
                />
            </Grid>
        </StatsGridWrapper>
    );
};
