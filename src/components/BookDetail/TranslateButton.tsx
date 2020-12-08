// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TranslationIcon from "./translation.svg";
import { commonUI } from "../../theme";
import { FormattedMessage, useIntl } from "react-intl";
import {
    downloadShellbook,
    DownloadShellbookDialog,
    IBookWithContextLanguage,
} from "./DownloadShellbookDialog";
import { useStorageState } from "react-storage-hooks";

interface ITranslateButtonProps extends IBookWithContextLanguage {
    fullWidth?: boolean;
}

export const TranslateButton: React.FunctionComponent<ITranslateButtonProps> = (
    props
) => {
    const l10n = useIntl();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useStorageState<boolean>(
        localStorage,
        "dont-show-download-shellbook-dialog",
        false
    );
    return (
        <React.Fragment>
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
                    <img
                        alt={l10n.formatMessage({
                            id: "book.detail.translateButton.downloadIcon",
                            defaultMessage: "Download Translation Icon",
                        })}
                        src={TranslationIcon}
                    />
                }
                onClick={() => {
                    props.book
                        .checkCountryPermissions("downloadShell")
                        .then((otherCountryRequired) => {
                            if (otherCountryRequired) {
                                alert(
                                    `Sorry, the uploader of this book has restricted shellbook download to ${otherCountryRequired}`
                                );
                            } else {
                                if (dontShowAgain) {
                                    downloadShellbook(props);
                                } else {
                                    setDialogOpen(true);
                                }
                            }
                        });
                }}
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
                        <FormattedMessage
                            id="book.detail.translateButton.translate"
                            defaultMessage="Translate into <emphasis>your</emphasis> language!"
                            values={{
                                emphasis: (str: string) => <em>{str}</em>,
                            }}
                        />
                    </p>
                    <p
                        css={css`
                            font-size: 9pt;
                            line-height: 1.1;
                            text-transform: initial;
                            margin-top: 2px;
                        `}
                    >
                        <FormattedMessage
                            id="book.detail.translateButton.download"
                            defaultMessage="Download into Bloom Editor"
                        />
                    </p>
                </div>
            </Button>
            <DownloadShellbookDialog
                book={props.book}
                open={dialogOpen}
                close={(dontShowAgainFromDialog: boolean) => {
                    // We shouldn't need to set this here because it has already been set in the dialog.
                    // But apparently two components cannot both actively monitor the same useStorageState
                    // variable at the same time. Without this hack, if the user checks the box to not show
                    // the dialog again, it keeps showing up through the end of that session.
                    setDontShowAgain(dontShowAgainFromDialog);
                    setDialogOpen(false);
                }}
                contextLangIso={props.contextLangIso}
            ></DownloadShellbookDialog>
        </React.Fragment>
    );
};
