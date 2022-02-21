// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { commonUI } from "../../theme";

import { SortingState, IntegratedSorting } from "@devexpress/dx-react-grid";
import {
    Grid,
    Table,
    TableHeaderRow,
    TableColumnResizing,
} from "@devexpress/dx-react-grid-material-ui";
import { IGridColumn } from "../Grid/GridColumns";
import React, { useState } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { useGetBookComprehensionEventStats } from "./useGetBookStats";
import { useProvideDataForExport } from "../../export/exportData";
import { useIntl } from "react-intl";
import { StatsGridWrapper } from "./GridWrapper";

export const ComprehensionQuestionsReport: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const l10n = useIntl();
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
        //{ name: "meanCorrect", title: "Mean Percent Correct" },
        { name: "medianCorrect", title: "Median Percent Correct" },
    ];
    // localize
    columns.forEach((c) => {
        const s = l10n.formatMessage({
            id: c.l10nId ?? "stats." + c.name,
            defaultMessage: c.title,
        });
        c.title = s;
    });

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
        { columnName: "questions" },
        { columnName: "quizzesTaken" },
        { columnName: "meanCorrect" },
        { columnName: "medianCorrect" },
    ]);

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

    //  const [headerColumnExtensions] = useState([
    //      { columnName: "quizzesTaken", wordWrapEnabled: true },
    //      { columnName: "meanCorrect", wordWrapEnabled: true },
    //      { columnName: "medianCorrect", wordWrapEnabled: true },
    //  ]);
    return (
        <StatsGridWrapper stats={stats}>
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
                <TableColumnResizing
                    resizingMode={"nextColumn"}
                    defaultColumnWidths={columns.map((c) => ({
                        columnName: c.name,
                        width: "auto",
                    }))}
                />
                <TableHeaderRow
                    cellComponent={CustomTableHeaderCell}
                    showSortingControls
                />
            </Grid>
        </StatsGridWrapper>
    );
};
