import css from "@emotion/css/macro";
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { commonUI } from "../../theme";

import { Paper } from "@material-ui/core";

export const BookNotice: React.FunctionComponent<{}> = (props) => {
    return (
        <Paper
            css={css`
                padding: 10px;
                display: flex;
                flex-direction: row;
                color: ${commonUI.colors.bloomRed};
                background-color: white;
                margin-top: 10px;
            `}
            {...props}
        >
            {props.children}
        </Paper>
    );
};
