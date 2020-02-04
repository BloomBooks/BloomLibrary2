// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TranslationIcon from "./translation.svg";

interface IProps {
    id: string;
}
export const TranslateButton: React.FunctionComponent<IProps> = props => {
    return (
        <Button
            variant="outlined"
            color="secondary"
            size="large"
            css={css`
                margin-top: 16px !important;
                width: 250px;
                height: 80px;
                display: block;
                padding-top: 3px; /* shift it all up*/
            `}
            startIcon={<img src={TranslationIcon} />}
        >
            <div
                css={css`
                    display: block;
                `}
            >
                <p
                    css={css`
                        text-transform: initial;
                        font-weight: normal;
                        font-size: 14pt;
                        line-height: 1.2;
                        margin-top: 0;
                        margin-bottom: 0;
                    `}
                >
                    {"Translate into"} <em>your</em> {"language!"}
                </p>
                <p
                    css={css`
                        font-size: 9pt;
                        line-height: 1.1;
                        text-transform: initial;
                    `}
                >
                    Download into Bloom Editor
                </p>
            </div>
        </Button>
    );
};
