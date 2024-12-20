import { css } from "@emotion/react";

import React from "react";
import { FormattedMessage } from "react-intl";
import TranslationIcon from "../../assets/Translation.svg?react";
import { Theme } from "@material-ui/core";
import { commonUI } from "../../theme";

// This file used to be the whole DownloadToBloomButton. Then we added the option of a GetTemplateButton
// when the book to be downloaded is a template. Now this is just the bits that are unique to non-templates.
export const TranslateButton: React.FunctionComponent = (props) => {
    return (
        <React.Fragment>
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                `}
            >
                <div
                    css={css`
                        text-transform: initial;
                        font-weight: normal;
                        font-size: 14pt;
                        line-height: 1.2;
                        text-wrap: balance;
                    `}
                >
                    <FormattedMessage
                        id="book.detail.translateButton.translate"
                        defaultMessage="Translate into <emphasis>your</emphasis> language!"
                        values={{
                            emphasis: (str: string) => <em>{str}</em>,
                        }}
                    />
                </div>
                <div
                    css={css`
                        font-size: 9pt;
                        line-height: 1.1;
                        text-transform: initial;
                        margin-top: 5px;
                        text-wrap: balance;
                    `}
                >
                    <FormattedMessage
                        id="book.detail.translateButton.download"
                        defaultMessage="Download into Bloom Editor"
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export function getTranslateIcon(theme: Theme, inResources: boolean) {
    return (
        <TranslationIcon
            fill={
                inResources
                    ? theme.palette.primary.main
                    : commonUI.colors.bloomBlue
            }
        />
    );
}
