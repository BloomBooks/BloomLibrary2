// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import DownloadIcon from "../../assets/download_white_24dp.svg";
import { commonUI } from "../../theme";
import { getArtifactUrl } from "../BookDetail/ArtifactHelper";
import { Book, ArtifactType } from "../../model/Book";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { track } from "../../analytics/Analytics";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

interface IProps {
    book: Book;
    fullWidth?: boolean;
    contextLangIso?: string;
}

// A button designed to be used when BL is embedded in Bloom Reader. It iniates download of the book
// passed in its props and brings up the ReaderDownloadingPage.
export const ReaderDownloadButton: React.FunctionComponent<IProps> = (
    props
) => {
    const l10n = useIntl();
    const history = useHistory();
    const artifactUrl = getArtifactUrl(props.book, ArtifactType.bloomReader);
    const parts = artifactUrl.split("/");
    const fileName = parts[parts.length - 1];
    const [fileSize, setFileSize] = useState("");
    useEffect(() => {
        if (artifactUrl) {
            get_filesize(artifactUrl, (size) => {
                if (size > 1000000) {
                    const mbTimes10 = Math.round(size / 1000000);
                    setFileSize(mbTimes10 / 10 + "MB");
                } else {
                    const kbSize = Math.round(size / 1000);
                    setFileSize(kbSize + "KB");
                }
            });
        }
    }, [artifactUrl]);
    return (
        // A link to download the .bloomd/.bloompub file
        <a
            href={artifactUrl}
            // This is more than a hint. Without an explicit download attribute,
            // the browser will reload the whole SPA as it first tries to navigate
            // to the URL, then discovers that it's just a download.
            download={fileName}
            onClick={() => {
                const params = getBookAnalyticsInfo(
                    props.book,
                    props.contextLangIso,
                    "bloompub"
                );
                track("Download Book", params);
                history.push(
                    "/reader/downloading" +
                        (props.contextLangIso
                            ? "?lang=" + props.contextLangIso
                            : "")
                );
                // Things are set up so this can pass the URL to BloomReader
                const brReceiver = (window as any).ParentProxy?.postMessage;
                if (brReceiver) {
                    brReceiver("download:" + artifactUrl);
                }
            }}
        >
            <Button
                variant="contained"
                color="secondary"
                startIcon={
                    <img
                        src={DownloadIcon}
                        alt={l10n.formatMessage({
                            id: "book.metadata.download",
                            defaultMessage: "Download",
                        })}
                        css={css`
                            width: 60px;
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
                                line-height: 19px;
                            `}
                        >
                            <FormattedMessage
                                id="book.metadata.download"
                                defaultMessage="Download"
                            />
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
                        {fileSize}
                    </p>
                </div>
            </Button>
        </a>
    );
};

// Get the size of the thing that the specified URL would obtain.
function get_filesize(url: string, callback: (size: number) => void) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
    //  to get only the header
    xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
            const size = xhr.getResponseHeader("Content-Length");
            if (size) {
                callback(parseInt(size));
            }
        }
    };
    xhr.send();
}
