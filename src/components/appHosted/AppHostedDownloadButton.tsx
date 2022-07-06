// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import DownloadIcon from "../../assets/download_white_24dp.svg";
import { commonUI } from "../../theme";
import { getArtifactUrl } from "../BookDetail/ArtifactHelper";
import { Book, ArtifactType } from "../../model/Book";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { track } from "../../analytics/Analytics";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router-dom";
import { appHostedMarker, useGetArtifactSize } from "./AppHostedUtils";
import { useCookies } from "react-cookie";

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
    const fileSize = useGetArtifactSize(artifactUrl);
    const [cookies, setCookie] = useCookies(["preferredLanguages"]);
    const { search } = useLocation();
    const currentLangCode = new URLSearchParams(search).get("lang");

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
                    "/" +
                        appHostedMarker +
                        "/downloading" +
                        (props.contextLangIso
                            ? "?lang=" + props.contextLangIso
                            : "")
                );
                if (currentLangCode) {
                    // currentLangCode moves to the head of preferredLanguages.
                    // Its length is reduced to three.
                    // The current UI language will stay in the list until books have been downloaded from three
                    // other language collections.
                    // Enhance: consider inserting the language of any collection that gets opened
                    // as the last thing in the list. Thus, any collection you just opened would always
                    // be in the list, and there can be up to three recently opened collections until you start
                    // downloading, but once you do that, the first two slots are
                    // reserved for languages from which you have downloaded books.
                    // This gives priority to collections where you found something worth reading, but helps
                    // you get back to at least the MOST recent one you looked at.
                    const preferredLangsString = cookies["preferredLanguages"];
                    const preferredLangCodes = preferredLangsString
                        ? preferredLangsString.split(",")
                        : [l10n.locale];
                    const index = preferredLangCodes.indexOf(currentLangCode);
                    if (index > 0) {
                        preferredLangCodes.splice(index, 1); // remove it from non-initial position
                    }
                    if (index !== 0) {
                        preferredLangCodes.splice(0, 0, [currentLangCode]); // now first
                        preferredLangCodes.splice(3); // limit to 3, typically one row in BR
                        setCookie(
                            "preferredLanguages",
                            preferredLangCodes.join()
                        );
                    }
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
