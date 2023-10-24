// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@material-ui/core";
import { followUrl } from "./DownloadsGroup";
import { getArtifactUrl } from "./ArtifactHelper";
import { track } from "../../analytics/Analytics";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { Book, ArtifactType } from "../../model/Book";

interface IDownloadingShellbookDialogProps {
    open: boolean; // dialog is displayed when rendered with this true
    close: () => void;
    book: Book;
    contextLangTag?: string; // if we know the user is working with books in a particular language, this tells which one.
}

export const DownloadingShellbookDialog: React.FunctionComponent<IDownloadingShellbookDialogProps> = (
    props
) => {
    const handleClose = () => {
        props.close();
    };
    useEffect(() => {
        if (props.open) {
            downloadShellbook(props.book, props.contextLangTag);
        }
    }, [props.book, props.contextLangTag, props.open]);
    return (
        <Dialog open={props.open} onClose={handleClose}>
            <DialogTitle>
                <FormattedMessage
                    id="downloadShellbook.downloading.header"
                    defaultMessage="Here it comes!"
                    description="Heading for the download shellbook dialog. Indicates that the download should be happening now."
                />
            </DialogTitle>
            <DialogContent>
                <FormattedMessage
                    id="downloadShellbook.downloading.message"
                    defaultMessage="Bloom should run, download the book, and allow you to add it to your collection."
                />
            </DialogContent>
            <DialogActions>
                <Button
                    css={css`
                        padding-left: 0 !important;
                        @media (hover) {
                            &:hover {
                                background-color: transparent !important;
                            }
                        }
                    `}
                    onClick={() =>
                        downloadShellbook(props.book, props.contextLangTag)
                    }
                >
                    <FormattedMessage
                        id="downloadShellbook.tryAgain"
                        defaultMessage="Try downloading it again"
                        description="Text for a button on the download shellbook dialog."
                    />
                </Button>
                {/* This spacer div makes the first button left-aligned */}
                <div style={{ flex: "1 0 0" }} />
                <Button
                    variant="contained"
                    onClick={handleClose}
                    color="primary"
                    autoFocus
                >
                    <FormattedMessage id="common.OK" defaultMessage="OK" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

function downloadShellbook(book: Book, contextLangTag?: string) {
    const params = getBookAnalyticsInfo(book, contextLangTag, "shell");
    track("Download Book", params);
    followUrl(getArtifactUrl(book, ArtifactType.shellbook));
}
