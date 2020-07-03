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
import { IScreenProps } from "./CollectionStatsPage";

interface IBookDownload {
    bookid: string;
    timeofshelldownload: string;
}

interface IDailySessionsInfo {
    datelocal: string;
    bookbranding: string;
    country: string;
    bloomreadersessions: number;
}

export interface IComprehensionQuestionData {
    title: string;
    branding: string;
    questions: number;
    quizzesTaken: number;
    meanCorrect: number;
    medianCorrect: number;
}

function getFakeCQData(): IComprehensionQuestionData[] {
    return [
        {
            title: "(3-6a) The Good Brothers",
            branding: "PNG-RISE",
            questions: 3,
            quizzesTaken: 222,
            meanCorrect: 69,
            medianCorrect: 50,
        },
        {
            title: "(2-6a) Anni's Pineapple",
            branding: "PNG-RISE",
            questions: 3,
            quizzesTaken: 198,
            meanCorrect: 61,
            medianCorrect: 23,
        },
        {
            title: "(3-7a) Pidik Goes To The Market",
            branding: "PNG-RISE",
            questions: 5,
            quizzesTaken: 187,
            meanCorrect: 57,
            medianCorrect: 88,
        },
    ];
}

export const ComprehensionQuestionsReport: React.FunctionComponent<IScreenProps> = (
    props
) => {
    const cqData = getFakeCQData();
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
            <Grid rows={cqData} columns={columns}>
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
