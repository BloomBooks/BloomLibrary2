// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import TranslationIcon from "./translation.svg";
import { getArtifactUrl, ArtifactType } from "./ArtifactHelper";
import { Book } from "../../model/Book";
import { commonUI } from "../../theme";
import { track } from "../../Analytics";
import { getBookDetailsParams } from "./BookDetail";

export const TranslateButton: React.FunctionComponent<{
    book: Book;
    fullWidth?: boolean;
    contextLangIso?: string;
}> = (props) => {
    return (
        <Button
            variant="outlined"
            color="secondary"
            size="large"
            css={css`
                /*don't do this. When the READ button is hidden, this will make it not align with the top
                margin-top: 16px !important;*/
                width: ${props.fullWidth
                    ? "100%"
                    : commonUI.detailViewMainButtonWidth};
                height: ${commonUI.detailViewMainButtonHeight};
                display: flex;
                padding-top: 0px; /* shift it all up*/
                float: right;
                box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                    0px 1px 5px 0px rgba(0, 0, 0, 0.12);
            `}
            startIcon={
                <img alt="Download Translation Icon" src={TranslationIcon} />
            }
            onClick={() => {
                const params = getBookDetailsParams(
                    props.book,
                    props.contextLangIso,
                    "shell"
                );
                track("Download Book", params);
            }}
            /* TODO: give some UI around this. See BL-8111 */
            href={getArtifactUrl(props.book, ArtifactType.shellbook)}
        >
            <div
                css={css`
                    display: block;
                    padding-top: 5px;
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
                        margin-top: 2px;
                    `}
                >
                    Download into Bloom Editor
                </p>
            </div>
        </Button>
    );
};
