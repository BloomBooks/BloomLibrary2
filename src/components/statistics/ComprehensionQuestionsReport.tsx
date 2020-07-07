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

export const ComprehensionQuestionsReport: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const stats = useGetBookComprehensionEventStats(props);
    useProvideDataForExport(stats, props);

    const columns: IGridColumn[] = [
        { name: "title", title: "Book Title" },
        { name: "branding", title: "Branding" },
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
        { columnName: "medianCorrect", width: 120 },
    ] as Table.ColumnExtension[]);

    const CustomTableHeaderCell = (cellProps: any) => {
        const adjustedProps = { ...cellProps };
        adjustedProps.value =
            adjustedProps.column.title || adjustedProps.column.name;
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
                        `}
                    >
                        <div
                            css={css`
                                width: 20px;
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
                <IntegratedSorting />
                <Table
                    columnExtensions={tableColumnExtensions}
                    cellComponent={CustomTableCell}
                />
                <TableHeaderRow
                    cellComponent={CustomTableHeaderCell}
                    showSortingControls
                />
            </Grid>
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
