// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import ReadIcon from "../../assets/read.svg";

//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import titleCase from "title-case";

interface IProps {
    id: string;
}
export const ReadButton: React.FunctionComponent<IProps> = props => {
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
            `}
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
