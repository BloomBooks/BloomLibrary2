// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { observer } from "mobx-react";

import pdfIcon from "./PDF.svg";
import ePUBIcon from "./ePUB.svg";
import bloomPubIcon from "./BloomPub.svg";

import { Book } from "../../model/Book";
import {
    getArtifactUrl,
    ArtifactType,
    getArtifactVisibilitySettings,
} from "./ArtifactHelper";
import { OSFeaturesContext } from "../OSFeaturesContext";
import { ArtifactVisibilitySettings } from "../../model/ArtifactVisibilitySettings";
import { track } from "../../analytics/Analytics";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { FormattedMessage, useIntl } from "react-intl";
import Typography from "@material-ui/core/Typography/Typography";

interface IArtifactUI {
    icon: string;
    alt: string;
    type: ArtifactType;
    settings: ArtifactVisibilitySettings | undefined;
    enabled: boolean;
    hidden?: boolean | undefined;
    analyticsType: string;
}

export const DownloadsGroup: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = observer((props) => {
    const l10n = useIntl();
    const { bloomReaderAvailable, cantUseBloomD, mobile } = useContext(
        OSFeaturesContext
    );
    const pdfSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.pdf
    )!;
    const epubSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.epub
    );
    const bloomReaderSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.bloomReader
    );
    const haveABloomPubToDownload: boolean =
        bloomReaderSettings?.decision === true;
    // If bloom reader is available for this device and we have a bloomd, a more prominent button is shown elsewhere.
    const showingBloomReaderDownloadElsewhere =
        bloomReaderAvailable && haveABloomPubToDownload;

    // We show the bloomD download button here if
    // (a) we're not showing the larger button elsewhere, and
    // (b) we're not on a device (like an iphone) which we consider to have no good reason to download it, and
    // (c) we're not on a mobile (touch) device and the button would be disabled
    const showBloomPUBButton: boolean =
        !showingBloomReaderDownloadElsewhere &&
        !cantUseBloomD &&
        !(mobile && !haveABloomPubToDownload);

    const hidePdfButton: boolean = mobile && !pdfSettings?.decision;
    const hideEpubButton: boolean = mobile && !epubSettings?.decision;

    // If we're showing a bloomd download button elsewhere, add a heading above the other downloads.
    const showMoreDownloadsHeading: boolean =
        showingBloomReaderDownloadElsewhere &&
        (!hidePdfButton || !hideEpubButton);
    return (
        <div>
            {/* {showMoreDownloadsHeading && ( */}
            <div
                css={css`
                    /* width: 300px; */
                    /* display: inline-block;
                    margin-top: 12px; */
                    //margin-bottom: 1em;
                `}
            >
                <Typography variant="caption">
                    <FormattedMessage
                        id="book.metadata.download"
                        defaultMessage="Download"
                    />
                </Typography>
            </div>
            {/* )} */}
            <ul
                // margin-left defeats the padding built into mui-buttons, so the
                // row can be left-aligned when in mobile layout where it is on the left.
                // margin-right allows right-aligning when in desktop layout mode.
                // margin-top defeats most of the mui padding to bring the buttons closer
                // to the heading if there is one.
                css={css`
                    margin: 0;
                    margin-left: -12px;
                    margin-right: -12px;
                    margin-top: ${showMoreDownloadsHeading ? "-10px" : "0"};
                    list-style: none;
                    padding: 0;
                `}
            >
                {[
                    {
                        icon: pdfIcon,
                        alt: l10n.formatMessage({
                            id: "book.artifacts.pdf",
                            defaultMessage: "Download PDF",
                        }),
                        type: ArtifactType.pdf,
                        settings: pdfSettings,
                        enabled: pdfSettings?.decision === true,
                        hidden: hidePdfButton,
                        analyticsType: "pdf",
                    },
                    {
                        icon: ePUBIcon,
                        alt: l10n.formatMessage({
                            id: "book.artifacts.epub",
                            defaultMessage: "Download ePUB",
                        }),
                        type: ArtifactType.epub,
                        settings: epubSettings,
                        enabled:
                            epubSettings?.decision === true &&
                            props.book.harvestState === "Done",
                        hidden: hideEpubButton,
                        analyticsType: "epub",
                    },
                    {
                        icon: bloomPubIcon,
                        alt: l10n.formatMessage({
                            id: "book.artifacts.bloompub",
                            defaultMessage:
                                "Download BloomPUB for Bloom Reader or BloomPub Viewer",
                        }),
                        type: ArtifactType.bloomReader,
                        settings: bloomReaderSettings,
                        enabled:
                            haveABloomPubToDownload &&
                            props.book.harvestState === "Done",
                        hidden: !showBloomPUBButton,
                        analyticsType: "bloompub",
                    },
                ].map((a: IArtifactUI) => {
                    const artifactUrl = getArtifactUrl(props.book, a.type);
                    const parts = artifactUrl.split("/");
                    const fileName = parts[parts.length - 1];
                    return (
                        !a.hidden && (
                            <Tooltip
                                key={a.alt}
                                aria-label={`${a.alt} is not available`}
                                title={
                                    a.settings?.reasonForHiding(
                                        props.book,
                                        l10n
                                    ) || a.alt
                                }
                                arrow={true}
                            >
                                <IconButton
                                    onClick={() => {
                                        props.book
                                            .checkCountryPermissions(
                                                "downloadAnything"
                                            )
                                            .then((otherCountryRequired) => {
                                                if (otherCountryRequired) {
                                                    alert(
                                                        `Sorry, the uploader of this book has restricted downloading it to ${otherCountryRequired}`
                                                    );
                                                } else {
                                                    followUrl(
                                                        artifactUrl,
                                                        fileName
                                                    );
                                                    const params = getBookAnalyticsInfo(
                                                        props.book,
                                                        props.contextLangIso,
                                                        a.analyticsType
                                                    );
                                                    track(
                                                        "Download Book",
                                                        params
                                                    );
                                                }
                                            });
                                    }}
                                >
                                    {!a.enabled && (
                                        <div
                                            css={css`
                                                background-color: #ffffffb5;
                                                position: absolute;
                                                height: 100%;
                                                width: 100%;
                                            `}
                                        ></div>
                                    )}
                                    {/* We'd like this to be a link, but then the compiler insists it must
                                    have an href, and then we can't impose conditions on doing the download. */}
                                    <span role="link" key={a.alt}>
                                        <img src={a.icon} alt={a.alt} />
                                    </span>
                                </IconButton>
                            </Tooltip>
                        )
                    );
                })}
            </ul>
        </div>
    );
});

// There ought to be an easier way of doing this, but I can't find it.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
// indicates that there is an api browser.downloads.download, but it's not supported on at least
// one browser, so this is safer.
// Appreciation to https://davidwalsh.name/javascript-download for this idea.
// The idea is to do whatever the browser would normally do when a link is clicked,
// if the link has the specified url as its href, and (optionally) the specified fileName
// as its download attribute. With a filename, the user will be given a chance to
// save the specified file from the URL. Without one, potentially we might navigate to the
// link, but the other main use case besides a simple file download is downloading to Bloom desktop,
//  where the URL is a special one that causes Bloom Desktop to be launched to handle the download.
export function followUrl(url: string, fileName?: string) {
    // Create an invisible A element
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);

    // Set the HREF to the thing we want to download.
    a.href = url;

    // Use download attribute to specify filename and prevent actually navigating
    if (fileName) {
        a.setAttribute("download", fileName);
    }

    // Trigger the download by simulating click
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(a.href); // from copied example, not sure why
    document.body.removeChild(a);
}
