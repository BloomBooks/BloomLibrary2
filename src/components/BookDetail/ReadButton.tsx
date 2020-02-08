// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, useContext } from "react";
import Button from "@material-ui/core/Button";
import ReadIcon from "./read.svg";
import { RouterContext } from "../../Router";

interface IProps {
    id: string;
}
export const ReadButton: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={
                <img
                    src={ReadIcon}
                    alt="read"
                    css={css`
                        width: 35px;
                        margin-right: 10px;
                    `}
                />
            }
            size="large"
            css={css`
                width: 250px;
                height: 80px;
                margin-bottom: 10px !important;
                float: right;
            `}
            onClick={() => router!.pushBookRead(props.id)}
        >
            <h1
                css={css`
                    margin-bottom: 15px; /*hack without which, the text is not in the vertical center of the button with the icon*/
                `}
            >
                READ
            </h1>
        </Button>
    );
};
