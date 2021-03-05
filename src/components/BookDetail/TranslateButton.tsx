// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { ReactComponent as TranslationIcon } from "../../assets/Translation.svg";
import { commonUI } from "../../theme";
import { FormattedMessage } from "react-intl";
import { DownloadPreflightDialog } from "./DownloadPreflightDialog";
import { useStorageState } from "react-storage-hooks";
import { DownloadingShellbookDialog } from "./DownloadingShellbookDialog";
import { Book } from "../../model/Book";
import { useTheme } from "@material-ui/core";
import { useLocation } from "react-router-dom";

interface ITranslateButtonProps {
    book: Book;
    contextLangIso?: string; // if we know the user is working with books in a particular language, this tells which one.
    fullWidth?: boolean;
}

export const TranslateButton: React.FunctionComponent<ITranslateButtonProps> = (
    props
) => {
    const theme = useTheme();
    const [preflightDialogOpen, setPreflightDialogOpen] = useState(false);
    const [downloadingDialogOpen, setDownloadingDialogOpen] = useState(false);
    const [
        dontShowPreflightAgain,
        setDontShowPreflightAgain,
    ] = useStorageState<boolean>(
        localStorage,
        "dont-show-download-preflight-dialog",
        false
    );

    // Ideally, this would be defined at some higher level and I could just use it here.
    // But since it uses a hook, that greatly limits our ability to extract it.
    // It didn't seem worth adding a whole new context provider.
    const inCreate =
        useLocation().pathname.toLowerCase().indexOf("create") > -1;

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
                    float: right;
                    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                        0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                `}
                startIcon={
                    <TranslationIcon
                        fill={
                            inCreate
                                ? theme.palette.primary.main
                                : commonUI.colors.bloomBlue
                        }
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
                                if (dontShowPreflightAgain) {
                                    setDownloadingDialogOpen(true);
                                } else {
                                    setPreflightDialogOpen(true);
                                }
                            }
                        });
                }}
            >
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
                        `}
                    >
                        <FormattedMessage
                            id="book.detail.translateButton.download"
                            defaultMessage="Download into Bloom Editor"
                        />
                    </div>
                </div>
            </Button>
            <DownloadPreflightDialog
                book={props.book}
                open={preflightDialogOpen}
                close={(
                    doDownload: boolean,
                    dontShowPreflightAgainFromDialog: boolean
                ) => {
                    // We shouldn't need to set this here because it has already been set in the dialog.
                    // But apparently two components cannot both actively monitor the same useStorageState
                    // variable at the same time. Without this hack, if the user checks the box to not show
                    // the dialog again, it keeps showing up through the end of that session.
                    setDontShowPreflightAgain(dontShowPreflightAgainFromDialog);
                    setPreflightDialogOpen(false);
                    if (doDownload) {
                        setDownloadingDialogOpen(true);
                    }
                }}
                contextLangIso={props.contextLangIso}
            ></DownloadPreflightDialog>
            <DownloadingShellbookDialog
                book={props.book}
                open={downloadingDialogOpen}
                close={() => {
                    setDownloadingDialogOpen(false);
                }}
                contextLangIso={props.contextLangIso}
            ></DownloadingShellbookDialog>
        </React.Fragment>
    );
};
