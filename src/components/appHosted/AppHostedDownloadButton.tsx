// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import Button from "@material-ui/core/Button";
import DownloadIcon from "../../assets/download_white_24dp.svg?react";
import { commonUI } from "../../theme";
import {
    getArtifactUrl,
    ArtifactType,
    getArtifactVisibilitySettings,
} from "../BookDetail/ArtifactHelper";
import { Book } from "../../model/Book";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { track } from "../../analytics/Analytics";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { useGetArtifactSize } from "./AppHostedUtils";
import { useCookies } from "react-cookie";

// A button designed to be used when BL is embedded in an app.
// It initiates download of the artifact (usually a bloompub) for the given book.
export const AppHostedDownloadButton: React.FunctionComponent<{
    book: Book;
    fullWidth?: boolean;
    contextLangTag?: string;
    className?: string;
}> = (props) => {
    const l10n = useIntl();
    const [cookies, setCookie] = useCookies(["preferredLanguages"]);
    const { search } = useLocation();

    function useGetArtifactType() {
        let artifactType: ArtifactType = ArtifactType.bloomReader;

        // If the url specifies the download format, use that instead of the default.
        // Get the download format from the url (e.g. ?formats=bloomSource).
        const downloadFormat = new URLSearchParams(useLocation().search).get(
            "formats"
        );
        if (downloadFormat) {
            // Currently, the only known user is SP App which uses "bloomSource".
            if (downloadFormat.toLowerCase() === "bloomsource") {
                artifactType = ArtifactType.bloomSource;
            } else {
                const possibleType =
                    ArtifactType[downloadFormat as keyof typeof ArtifactType];
                if (possibleType) {
                    artifactType = possibleType;
                }
            }
        }
        return artifactType;
    }

    const artifactType = useGetArtifactType();

    function useGetArtifactUrl() {
        return artifactType && getArtifactUrl(props.book, artifactType);
    }

    const artifactUrl = useGetArtifactUrl();
    const fileSize = useGetArtifactSize(artifactUrl);

    const shouldShow =
        artifactType &&
        getArtifactVisibilitySettings(props.book, artifactType)?.decision ===
            true;

    if (!shouldShow) return <React.Fragment />;

    const parts = artifactUrl.split("/");
    const fileName = parts[parts.length - 1];
    const currentLangCode = new URLSearchParams(search).get("lang");

    return (
        // A link to download the file
        <a
            href={artifactUrl}
            // This is more than a hint. Without an explicit download attribute,
            // the browser will reload the whole SPA as it first tries to navigate
            // to the URL, then discovers that it's just a download.
            download={fileName}
            className={props.className} // support emotion
            onClick={() => {
                const params = getBookAnalyticsInfo(
                    props.book,
                    props.contextLangTag,
                    "bloompub"
                );
                track("Download Book", params);
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
                        preferredLangCodes.length = 3; // limit to 3, typically one row in BR
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
                color="primary"
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
                            font-size: 0.75rem;
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
