import css from "@emotion/css/macro";
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
import { BookNotice } from "./BookNotice";

export const BookProblemNotice: React.FunctionComponent<{}> = (props) => {
    return (
        <BookNotice>
            <ReportProblemOutlinedIcon />
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
