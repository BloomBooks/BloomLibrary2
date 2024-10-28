// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React, { useEffect, useRef, useState } from "react";
import Button from "@material-ui/core/Button";
import { commonUI } from "../../theme";
import { DownloadPreflightDialog } from "./DownloadPreflightDialog";
import { useStorageState } from "react-storage-hooks";
import { DownloadingShellbookDialog } from "./DownloadingShellbookDialog";
import { Book } from "../../model/Book";
import { useTheme } from "@material-ui/core";
import { useLocation } from "react-router-dom";
import { getTranslateIcon, TranslateButton } from "./TranslateButton";
import { GetTemplateButton } from "./GetTemplateButton";
import { isInResourcesSectionOfSite } from "../pages/ThemeForLocation";

interface ITranslateButtonProps {
    book: Book;
    contextLangTag?: string; // if we know the user is working with books in a particular language, this tells which one.
    fullWidth?: boolean;
}

// This is the root button that downloads a book to Bloom Editor. Usually it reads "Translate this into your language"
// but this does not make sense for template books so that has a different wording. Allow room for the "Get this Template"
// version to be considerably higher than the usual one.
// Note: if investigating history, be aware that most of this code was refactored from the TranslateButton, which
// used to be the only version.
export const DownloadToBloomButton: React.FunctionComponent<ITranslateButtonProps> = (
    props
) => {
    const theme = useTheme();
    const showDownloadDialog = useRef<() => void | undefined>();

    // Ideally, this would be defined at some higher level and I could just use it here.
    // But since it uses a hook, that greatly limits our ability to extract it.
    // It didn't seem worth adding a whole new context provider.
    const inResources = isInResourcesSectionOfSite(useLocation().pathname);

    // This set of three properties controls how the translate version is different
    // from the template version. If it gets any more complicated, we should create
    // something to encapsulate the variations. For example, we might give each option
    // a single function that returns {startButton, content, buttonHeight}, or if it
    // gets still more complicated, a class that each button can subclass. But it doesn't
    // seem quite worth it yet.

    // We show drastically different content on the button if the book is a template,
    // since it makes no sense to translate a template.
    const isTemplate = props.book.suitableForMakingShells;

    // This is the value of the startIcon property built into the material UI
    // Button. It works well for laying out the TranslateButton and lets us
    // exactly preserve the previous behavior we were happy with.
    // Unfortunately it doesn't work at all for the TemplateButton layout, so we
    // leave it undefined and insert the icon manually into the proper place in the
    // layout. We could do the same for TranslateButton, but I'd rather not mess
    // with a layout that isn't broken.
    const startButton = isTemplate
        ? undefined
        : getTranslateIcon(theme, inResources);

    // Main content of the two versions of the button.
    const content = isTemplate ? (
        <GetTemplateButton inResources={inResources} />
    ) : (
        <TranslateButton />
    );

    // The detailViewMainButtonHeight is way too small for the template version of the button.
    // But an explicit height has to be sufficient even for translations, since the button
    // will happily overflow its text out of the button onto other elements. And an explicit
    // height that is OK for English in the wide configuration is a lot more than we need
    // when the button has its own entire row on small screens, and the long text flows into
    // fewer lines. So for template buttons I'm just letting the content dictate the size.
    const buttonHeight = isTemplate
        ? "initial"
        : commonUI.detailViewMainButtonHeight;

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
                    height: ${buttonHeight};
                    display: flex;
                    float: right;
                    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                        0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                `}
                startIcon={startButton}
                onClick={() => {
                    props.book
                        .checkCountryPermissions("downloadShell")
                        .then((otherCountryRequired) => {
                            if (otherCountryRequired) {
                                alert(
                                    `Sorry, the uploader of this book has restricted shellbook download to ${otherCountryRequired}`
                                );
                            } else {
                                showDownloadDialog.current?.();
                            }
                        });
                }}
            >
                {content}
            </Button>
            <DownloadToBloomDialogs
                book={props.book}
                getShowFunction={(download) =>
                    (showDownloadDialog.current = download)
                }
                contextLangTag={props.contextLangTag}
                forEdit={false}
            ></DownloadToBloomDialogs>
        </React.Fragment>
    );
};

// This is a wrapper around the two dialogs that can be shown when the user clicks a button
// to download a book to Bloom. It is a separate component so that the dialogs and the logic for
// whether to show the preflight dialog can be shared between the TranslateButton and the
// download-for-editing button.
export const DownloadToBloomDialogs: React.FunctionComponent<{
    book: Book;
    // This function is called when this component is rendered (and if it is re-rendered with a new function).
    // This component is invisible until the client calls the function that is passed to this callback.
    // When it is called, one or both dialogs will be shown, and if the user does not cancel and all goes well, the
    // download will begin. (See above for a typical way to save the function in a ref and use it.)
    getShowFunction: (show: () => void) => void;
    contextLangTag?: string;
    forEdit: boolean;
}> = (props) => {
    const getShowFunction = props.getShowFunction;
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
    useEffect(() => {
        const doDownload = () => {
            if (dontShowPreflightAgain) {
                setDownloadingDialogOpen(true);
            } else {
                setPreflightDialogOpen(true);
            }
        };
        getShowFunction(doDownload);
    }, [dontShowPreflightAgain, getShowFunction]);
    return (
        <>
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
                contextLangTag={props.contextLangTag}
            ></DownloadPreflightDialog>
            <DownloadingShellbookDialog
                book={props.book}
                open={downloadingDialogOpen}
                close={() => {
                    setDownloadingDialogOpen(false);
                }}
                contextLangTag={props.contextLangTag}
                forEdit={props.forEdit}
            ></DownloadingShellbookDialog>
        </>
    );
};
