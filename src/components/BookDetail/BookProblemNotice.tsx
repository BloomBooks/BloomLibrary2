import css from "@emotion/css/macro";
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
import ErrorIcon from "@material-ui/icons/Error";
import { BookNotice } from "./BookNotice";

export const BookProblemNotice: React.FunctionComponent<{
    errorIcon?: boolean;
}> = (props) => {
    return (
        <BookNotice>
            {props.errorIcon ? <ErrorIcon /> : <ReportProblemOutlinedIcon />}
            <div
                css={css`
                    margin-left: 10px;
                    a {
                        text-decoration: underline;
                    }
                `}
            >
                {props.children}
            </div>
        </BookNotice>
    );
};
