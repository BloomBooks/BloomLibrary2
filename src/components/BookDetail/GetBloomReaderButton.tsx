// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import { PlayStoreIcon } from "./PlayStoreIcon";
import { commonUI } from "../../theme";
import { FormattedMessage } from "react-intl";

interface IProps {
    fullWidth?: boolean;
}

export const GetBloomReaderButton: React.FunctionComponent<IProps> = (
    props
) => {
    return (
        <Button
            variant="outlined"
            color="secondary"
            startIcon={<PlayStoreIcon />}
            href="https://bloomlibrary.org/page/create/bloom-reader"
            size="large"
            css={css`
                width: ${props.fullWidth
                    ? "100%"
                    : commonUI.detailViewMainButtonWidth};
                height: ${commonUI.detailViewMainButtonHeight};
                margin-bottom: 10px !important;
                float: right;
            `}
        >
            <h1
                css={css`
                    margin-bottom: 0;
                    margin-top: 0;
                `}
            >
                <p
                    css={css`
                        margin-bottom: 0;
                        margin-top: 0;
                        line-height: 19px;
                    `}
                >
                    <FormattedMessage
                        id="book.detail.getBloomReader"
                        defaultMessage="Get Bloom Reader"
                    />
                </p>
            </h1>
        </Button>
    );
};
