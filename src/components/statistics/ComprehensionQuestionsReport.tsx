// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";

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

export const ComprehensionQuestionsReport: React.FunctionComponent<{
    cqData: IComprehensionQuestionData[];
    backColor: string;
}> = (props) => {
    return (
        <div
            css={css`
                color: ${commonUI.colors.bloomRed};
                background-color: ${props.backColor};
                padding: 5px;
                font-size: smaller;
            `}
        >
            <div
                css={css`
                    color: ${commonUI.colors.bloomRed};
                    margin-bottom: 10px;
                `}
            >
                Comprehension Questions
            </div>
            <div
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
                    {props.cqData.map((book) => (
                        <div key={book.title}>{book.title}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
