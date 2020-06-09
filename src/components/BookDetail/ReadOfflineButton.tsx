// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import BloomPubIcon from "./BloomPubWhite.svg";
import { commonUI } from "../../theme";
import { getArtifactUrl, ArtifactType } from "./ArtifactHelper";
import { Book } from "../../model/Book";

interface IProps {
    book: Book;
    fullWidth?: boolean;
}
export const ReadOfflineButton: React.FunctionComponent<IProps> = (props) => {
    return (
        // A link to download the .bloomd file
        <a href={getArtifactUrl(props.book, ArtifactType.bloomReader)}>
            <Button
                variant="contained"
                color="secondary"
                startIcon={
                    <img
                        src={BloomPubIcon}
                        alt="bloom reader document"
                        css={css`
                            width: 35px;
                            margin-right: 10px;
                        `}
                    />
                }
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
                <div>
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
                            `}
                        >
                            READ OFFLINE
                        </p>
                    </h1>
                    <p
                        css={css`
                            margin-bottom: 0;
                            margin-top: 0;
                            font-size: 9px;
                            text-transform: none;
                        `}
                    >
                        Download into Bloom Reader
                    </p>
                </div>
            </Button>
        </a>
    );
};
