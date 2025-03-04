import { css } from "@emotion/react";

import React from "react";
import { useStorageState } from "react-storage-hooks";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { FormControlLabel, Checkbox, DialogTitle } from "@material-ui/core";
import { Book } from "../../model/Book";
import { BlorgLink } from "../BlorgLink";

interface IDownloadPreflightDialogProps {
    open: boolean; // dialog is displayed when rendered with this true
    close: (doDownload: boolean, dontShowDialogAgain: boolean) => void;
    book: Book;
    contextLangTag?: string; // if we know the user is working with books in a particular language, this tells which one.
}

export const DownloadPreflightDialog: React.FunctionComponent<IDownloadPreflightDialogProps> = (
    props
) => {
    const l10n = useIntl();
    const [dontShowAgain, setDontShowAgain] = useStorageState<boolean>(
        localStorage,
        "dont-show-download-preflight-dialog",
        false
    );
    const handleCancel = () => {
        setDontShowAgain(false);
        props.close(false, false);
    };
    return (
        <Dialog open={props.open} onClose={handleCancel}>
            <DialogTitle>
                <FormattedMessage
                    id="downloadShellbook.aboutToDownload.heading"
                    defaultMessage="Almost there…"
                    description="Heading for the download shellbook dialog. Indicates that the download is about to start after one more step."
                />
            </DialogTitle>
            <DialogContent>
                <FormattedMessage
                    id="downloadShellbook.aboutToDownload.message"
                    defaultMessage="You are about to download {bookTitle} into the Bloom Desktop Application. You need to have <link>Bloom</link> already installed on your computer."
                    values={{
                        bookTitle: (
                            <em>
                                {props.book.getBestTitle(props.contextLangTag)}
                            </em>
                        ),
                        link: (linkText: string) => (
                            <BlorgLink href="/downloads">{linkText}</BlorgLink>
                        ),
                    }}
                    description="{bookTitle} will be replaced by the title of the book being downloaded. The text inside <link></link> will be a link to the downloads page of the Bloom library website."
                />
                {/* This div is needed to allow arbitrarily long book titles in FormattedMessage without
                    running into the Checkbox contained in the FormControlLabel.
                    See https://issues.bloomlibrary.org/youtrack/issue/BL-9847. */}
                <div>
                    <FormControlLabel
                        css={css`
                            margin-top: 15px;
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
                            id:
                                "downloadShellbook.aboutToDownload.dontShowAgain",
                            defaultMessage:
                                "I get it. Don't show me this again.",
                            description:
                                "Label for a check box which, if checked, prevents the extra dialog from appearing before downloading a shellbook.",
                        })}
                    />
                </div>
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
                        props.close(true, dontShowAgain);
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
