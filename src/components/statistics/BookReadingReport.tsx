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
import { useState, useContext } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useGetBookStats } from "./useGetBookStats";
import { useProvideDataForExport } from "./exportData";
import { CachedTablesContext } from "../../App";
import { getLanguageNamesFromCode } from "../../model/Language";
import { useIntl } from "react-intl";

export const BookReadingReport: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const stats = useGetBookStats(props);
    useProvideDataForExport(stats, props);
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);

    if (stats) {
        for (const stat of stats) {
            const languageDisplayName = getLanguageNamesFromCode(
                stat.language,
                languages
            )?.displayNameWithAutonym;
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
        { name: "finishedCount", title: "Finished" },
        { name: "startedCount", title: "Started" },
    ];
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
        { columnName: "finishedCount", width: "95px", align: "right" },

        { columnName: "startedCount", width: "95px", align: "right" },
    ] as Table.ColumnExtension[]);

    const i18n = useIntl();

    // This table might not need this...no column headers need wrapping?
    const CustomTableHeaderCell = (cellProps: any) => {
        const adjustedProps = { ...cellProps };
        adjustedProps.value =
            adjustedProps.column.title || adjustedProps.column.name;
        adjustedProps.column.title = i18n.formatMessage({
            id:
                adjustedProps.column.l10nId ??
                "stats.booksRead." + adjustedProps.column.name,
            defaultMessage: adjustedProps.column.title,
        });
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
        { columnName: "finishedCount", compare: compareNumbers },
        { columnName: "startedCount", compare: compareNumbers },
    ]);

    return (
        <div
            css={css`
                background-color: white;
                thead.MuiTableHead-root * {
                    line-height: 15px;
                    vertical-align: top;
                }
                // make the table line up with the rest of the page
                th,
                td:first-child {
                    padding-left: 0 !important;
                }
            `}
        >
            <Grid rows={stats!} columns={columns}>
                <SortingState
                    defaultSorting={[
                        { columnName: "quizzesTaken", direction: "desc" },
                    ]}
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
        </div>
    );
};

const compareNumbers = (a: string, b: string): number => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (numA === numB) {
        return 0;
    }
    return numA < numB ? -1 : 1;
};
