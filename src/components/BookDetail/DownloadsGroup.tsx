import { css } from "@emotion/react";

import React, { useContext, useEffect } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { observer } from "mobx-react-lite";

import PdfIcon from "../../assets/Pdf.svg?react";
import EPUBIcon from "../../assets/EPub.svg?react";
import { PlayStoreIcon } from "./PlayStoreIcon";
// See comment in BloomPubIcon about why this is a special case
import { BloomPubIcon } from "./BloomPubIcon";

import { Book } from "../../model/Book";
import {
    ArtifactType,
    getArtifactDownloadAltText,
    getArtifactUrl,
    getArtifactVisibilitySettings,
} from "./ArtifactHelper";
import { OSFeaturesContext } from "../OSFeaturesContext";
import { ArtifactVisibilitySettings } from "../../model/ArtifactVisibilitySettings";
import { track } from "../../analytics/Analytics";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { FormattedMessage, useIntl } from "react-intl";
import Typography from "@material-ui/core/Typography/Typography";
import { commonUI } from "../../theme";
import { BlorgLink } from "../BlorgLink";

interface IArtifactUI {
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    alt: string;
    type: ArtifactType;
    settings: ArtifactVisibilitySettings | undefined;
    enabled: boolean;
    hidden?: boolean | undefined;
    analyticsType: string;
    isSpacer?: boolean; // in this case, none of the rest really matters
}

export const DownloadsGroup: React.FunctionComponent<{
    book: Book;
    contextLangTag?: string;
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

    // I spent some time tracking this down, and don't want to do it again when I forget.
    // https://github.com/mui-org/material-ui/issues/13394
    useEffect(() => {
        console.warn(
            "The following findDOMNode error will go away in MaterialUI 5, currently (dec 2020) in alpha."
        );
    }, []);

    const enableBloomPub =
        haveABloomPubToDownload && props.book.harvestState === "Done";

    return (
        <div>
            {/* {showMoreDownloadsHeading && ( */}
            <div>
                <Typography variant="caption">
                    <FormattedMessage
                        id="book.metadata.download"
                        defaultMessage="Download"
                    />
                </Typography>
            </div>
            {/* )} */}
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                `}
            >
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
                        display: flex;
                        justify-content: start;
                    `}
                >
                    {[
                        {
                            icon: (p: React.SVGProps<SVGSVGElement>) => (
                                <BloomPubIcon {...p}></BloomPubIcon>
                            ),
                            alt: getArtifactDownloadAltText(
                                ArtifactType.bloomReader,
                                l10n
                            ),
                            type: ArtifactType.bloomReader,
                            settings: bloomReaderSettings,
                            enabled: enableBloomPub,
                            hidden: !showBloomPUBButton,
                            analyticsType: "bloompub",
                        },
                        {
                            // Add a spacer that has flex-grow and only shows if there is
                            // a bloomPUB artifact.
                            icon: (p: React.SVGProps<SVGSVGElement>) => (
                                <div></div>
                            ),
                            alt: "",
                            type: ArtifactType.bloomReader,
                            settings: bloomReaderSettings,
                            enabled: false,
                            hidden: !showBloomPUBButton,
                            analyticsType: "",
                            isSpacer: true,
                        },
                        {
                            icon: (p: React.SVGProps<SVGSVGElement>) => (
                                <PdfIcon {...p}></PdfIcon>
                            ),
                            alt: getArtifactDownloadAltText(
                                ArtifactType.pdf,
                                l10n
                            ),
                            type: ArtifactType.pdf,
                            settings: pdfSettings,
                            enabled: pdfSettings?.decision === true,
                            hidden: hidePdfButton,
                            analyticsType: "pdf",
                        },
                        {
                            icon: (p: React.SVGProps<SVGSVGElement>) => (
                                <EPUBIcon {...p}></EPUBIcon>
                            ),
                            alt: getArtifactDownloadAltText(
                                ArtifactType.epub,
                                l10n
                            ),
                            type: ArtifactType.epub,
                            settings: epubSettings,
                            enabled:
                                epubSettings?.decision === true &&
                                props.book.harvestState === "Done",
                            hidden: hideEpubButton,
                            analyticsType: "epub",
                        },
                    ].map((a: IArtifactUI) => {
                        const artifactUrl = getArtifactUrl(props.book, a.type);
                        const parts = artifactUrl.split("/");
                        const fileName = parts[parts.length - 1];
                        return (
                            !a.hidden && (
                                <Tooltip
                                    css={css`
                                        flex: ${a.isSpacer ? 3 : 0};
                                    `}
                                    key={a.alt}
                                    aria-label={`${a.alt} is not available`}
                                    title={
                                        a.settings?.reasonForHiding(
                                            props.book,
                                            l10n,
                                            a.type === ArtifactType.pdf
                                        ) || a.alt
                                    }
                                    arrow={true}
                                >
                                    <IconButton
                                        css={css`
                                            cursor: ${!a.enabled
                                                ? "default"
                                                : "pointer"};
                                        `}
                                        disableRipple={!a.enabled}
                                        disableFocusRipple={!a.enabled}
                                        disableTouchRipple={!a.enabled}
                                        // Only way I've found to disable the hover ripple:
                                        style={
                                            !a.enabled
                                                ? {
                                                      backgroundColor:
                                                          "transparent",
                                                  }
                                                : {}
                                        }
                                        // Can't do this or the tooltip doesn't work:
                                        // disabled={!a.enabled}
                                        onClick={() => {
                                            if (a.enabled)
                                                props.book
                                                    .checkCountryPermissions(
                                                        "downloadAnything"
                                                    )
                                                    .then(
                                                        (
                                                            otherCountryRequired
                                                        ) => {
                                                            if (
                                                                otherCountryRequired
                                                            ) {
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
                                                                    props.contextLangTag,
                                                                    a.analyticsType
                                                                );
                                                                track(
                                                                    "Download Book",
                                                                    params
                                                                );
                                                            }
                                                        }
                                                    );
                                        }}
                                    >
                                        {/* We'd like this to be a link, but then the compiler insists it must
                                    have an href, and then we can't impose conditions on doing the download. */}
                                        <span role="link" key={a.alt}>
                                            {a.icon({
                                                fill: a.enabled
                                                    ? commonUI.colors.bloomBlue
                                                    : commonUI.colors
                                                          .disabledIconGray,
                                            })}
                                        </span>
                                    </IconButton>
                                </Tooltip>
                            )
                        );
                    })}
                </ul>
                {showBloomPUBButton && enableBloomPub && (
                    <BlorgLink
                        href="/bloom-reader"
                        color="secondary" // bloomBlue
                        css={css`
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            margin-top: -16px; // reduce space between artifacts and 'Get Bloom Reader' link
                            margin-left: -7px; // line up vertically with BloomPUB icon
                        `}
                    >
                        <PlayStoreIcon />
                        <Typography variant="button">
                            <FormattedMessage
                                id="book.detail.getBloomReader"
                                defaultMessage="Get Bloom Reader"
                            />
                        </Typography>
                    </BlorgLink>
                )}
            </div>
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
