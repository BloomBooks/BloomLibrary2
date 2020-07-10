// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { commonUI } from "../../theme";

import {
    Grid,
    TableHeaderRow,
    Table,
} from "@devexpress/dx-react-grid-material-ui";
import { SortingState, IntegratedSorting } from "@devexpress/dx-react-grid";
import { IGridColumn } from "../Grid/GridColumns";
import { useState } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useGetBookComprehensionEventStats } from "./useGetBookStats";
import { useProvideDataForExport } from "./exportData";
import { useIntl } from "react-intl";

export const ComprehensionQuestionsReport: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const stats1 = useGetBookComprehensionEventStats(props);
    useProvideDataForExport(stats1, props);
    const stats = stats1
        ? stats1.filter((bookStatInfo) => {
              // Filter out non-null values
              // We'll just look at 2 of them. It'd also be fine to check all the relevant fields too, if desired.
              return bookStatInfo.quizzesTaken && bookStatInfo.questions;
          })
        : undefined;

    const columns: IGridColumn[] = [
        { name: "title", title: "Book Title", l10nId: "bookTitle" },
        { name: "branding", title: "Branding", l10nId: "branding" },
        { name: "questions", title: "Questions" },
        { name: "quizzesTaken", title: "Quizzes Taken" },
        { name: "meanCorrect", title: "Mean Percent Correct" },
        { name: "medianCorrect", title: "Median Percent Correct" },
    ];
    const [tableColumnExtensions] = useState([
        { columnName: "title", width: "20%", align: "left" },
        { columnName: "branding", width: "15%" },
        { columnName: "questions", width: "auto", align: "right" },
        { columnName: "quizzesTaken", width: "auto", align: "right" },
        { columnName: "meanCorrect", width: "auto", align: "right" },
        // 30px: number plus margin; 100px: 100% is 100px wide; 16px: material default padding
        { columnName: "medianCorrect", width: 30 + 100 + 16 },
    ] as Table.ColumnExtension[]);

    // Configure numeric sorts for the last two columns (so 453 is not less than 5)
    const [integratedSortingColumnExtensions] = useState([
        { columnName: "questions", compare: compareNumbers },
        { columnName: "quizzesTaken", compare: compareNumbers },
        { columnName: "meanCorrect", compare: compareNumbers },
        { columnName: "medianCorrect", compare: compareNumbers },
    ]);

    const i18n = useIntl();
    const CustomTableHeaderCell = (cellProps: any) => {
        const adjustedProps = { ...cellProps };
        adjustedProps.value =
            adjustedProps.column.title || adjustedProps.column.name;
        adjustedProps.column.title = i18n.formatMessage({
            id:
                adjustedProps.column.l10nId ??
                "stats." + adjustedProps.column.name,
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

    const CustomTableCell = (cellProps: any) => {
        const adjustedProps = { ...cellProps };
        if (cellProps.column.name === "medianCorrect") {
            return (
                <Table.Cell {...adjustedProps}>
                    <div
                        css={css`
                            display: flex;
                            flex-shrink: 0;
                        `}
                    >
                        <div
                            css={css`
                                width: 25px;
                                text-align: right;
                                margin-right: 5px;
                                flex-shrink: 0;
                            `}
                        >
                            {adjustedProps.value}
                        </div>
                        <div
                            css={css`
                                height: 10px;
                                margin-top: 4px;
                                width: ${adjustedProps.value}px;
                                background-color: ${commonUI.colors.bloomRed};
                                flex-shrink: 0;
                            `}
                        ></div>
                    </div>
                </Table.Cell>
            );
        } else {
            return <Table.Cell {...adjustedProps} />;
        }
    };

    const gotRows = stats && stats.length > 0;

    //  const [headerColumnExtensions] = useState([
    //      { columnName: "quizzesTaken", wordWrapEnabled: true },
    //      { columnName: "meanCorrect", wordWrapEnabled: true },
    //      { columnName: "medianCorrect", wordWrapEnabled: true },
    //  ]);
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
            {gotRows || <div>No data found</div>}
            {gotRows && (
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
                        cellComponent={CustomTableCell}
                    />
                    <TableHeaderRow
                        cellComponent={CustomTableHeaderCell}
                        showSortingControls
                    />
                </Grid>
            )}
            {/* <div
                css={css`
                    display: flex;
                `}
            >
                <div
                    css={css`
                        color: white;
                    `}
                >
                    <div
                        css={css`
                            font-weight: bold;
                        `}
                    >
                        Book Title
                    </div>
                    {cqData.map((book) => (
                        <div key={book.title}>{book.title}</div>
                    ))}
                </div>
            </div> */}
        </div>
    );
};

const compareNumbers = (
    a: string | undefined | null,
    b: string | undefined | null
): number => {
    // First check for falsy strings. These are problematic.
    // If you don't handle them, the list will become sorted in arbitrary order.
    // We'll just define nulls as being worse than 0... so... negative infinity.
    let numA = a ? parseFloat(a) : Number.NEGATIVE_INFINITY;
    if (isNaN(numA)) {
        // Parse errors are also problematic.
        numA = Number.NEGATIVE_INFINITY;
    }

    let numB = b ? parseFloat(b) : Number.NEGATIVE_INFINITY;
    if (isNaN(numB)) {
        numB = Number.NEGATIVE_INFINITY;
    }

    if (numA === numB) {
        return 0;
    }
    return numA < numB ? -1 : 1;
};
