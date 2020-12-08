// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { useStorageState } from "react-storage-hooks";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { FormControlLabel, Checkbox } from "@material-ui/core";
import { Book } from "../../model/Book";
import { BlorgLink } from "../BlorgLink";
import { followUrl } from "./DownloadsGroup";
import { getArtifactUrl, ArtifactType } from "./ArtifactHelper";
import { track } from "../../analytics/Analytics";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";

export interface IBookWithContextLanguage {
    book: Book;
    contextLangIso?: string; // if we know the user is working with books in a particular language, this tells which one.
}

interface IDownloadShellbookDialogProps extends IBookWithContextLanguage {
    open: boolean; // dialog is displayed when rendered with this true
    close: (dontShowDialogAgain: boolean) => void;
}

export const DownloadShellbookDialog: React.FunctionComponent<IDownloadShellbookDialogProps> = (
    props
) => {
    const l10n = useIntl();
    const [dontShowAgain, setDontShowAgain] = useStorageState<boolean>(
        localStorage,
        "dont-show-download-shellbook-dialog",
        false
    );
    const handleCancel = () => {
        setDontShowAgain(false);
        props.close(false);
    };
    return (
        <Dialog open={props.open} onClose={handleCancel}>
            <DialogContent>
                <h1
                    css={css`
                        font-size: 18pt;
                        color: black;
                    `}
                >
                    <FormattedMessage
                        id="downloadShellbook.aboutToDownload.heading"
                        defaultMessage="Almost there…"
                        description="Heading for the download shellbook dialog. Indicates that the download is about to start after one more step."
                    />
                </h1>
                <div
                    css={css`
                        margin-top: 25px;
                        color: black;
                    `}
                >
                    <FormattedMessage
                        id="downloadShellbook.aboutToDownload.message"
                        defaultMessage="You are about to download {bookTitle} into the Bloom Desktop Application. You need to have <link>Bloom</link> already installed on your computer."
                        values={{
                            bookTitle: (
                                <em>
                                    {props.book.getBestTitle(
                                        props.contextLangIso
                                    )}
                                </em>
                            ),
                            link: (linkText: string) => (
                                <BlorgLink href="/downloads">
                                    {linkText}
                                </BlorgLink>
                            ),
                        }}
                        description="{bookTitle} will be replaced by the title of the book being downloaded. The text inside <link></link> will be a link to the downloads page of the Bloom library website."
                    />
                </div>
                <FormControlLabel
                    css={css`
                        margin-top: 15px;
                        color: black;
                    `}
                    control={
                        <Checkbox
                            checked={dontShowAgain}
                            onChange={(e) => {
                                setDontShowAgain(e.target.checked);
                            }}
                        />
                    }
                    label={l10n.formatMessage({
                        id: "downloadShellbook.aboutToDownload.dontShowAgain",
                        defaultMessage: "I get it. Don't show me this again.",
                        description:
                            "Label for a check box which, if checked, prevents the extra dialog from appearing before downloading a shellbook.",
                    })}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="primary">
                    <FormattedMessage
                        id="common.cancel"
                        defaultMessage="Cancel"
                    />
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        downloadShellbook(props);
                        props.close(dontShowAgain);
                    }}
                    color="primary"
                    autoFocus
                >
                    <FormattedMessage
                        id="downloadBook"
                        defaultMessage="Download Book"
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export function downloadShellbook(bookWithLang: IBookWithContextLanguage) {
    const params = getBookAnalyticsInfo(
        bookWithLang.book,
        bookWithLang.contextLangIso,
        "shell"
    );
    track("Download Book", params);
    followUrl(getArtifactUrl(bookWithLang.book, ArtifactType.shellbook));
}
