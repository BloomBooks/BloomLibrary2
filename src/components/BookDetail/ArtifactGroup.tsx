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
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { ArtifactVisibilitySettings } from "../../model/ArtifactVisibilitySettings";
import { track } from "../../analytics/Analytics";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";

interface IArtifactUI {
    icon: string;
    alt: string;
    type: ArtifactType;
    settings: ArtifactVisibilitySettings | undefined;
    enabled: boolean;
    hidden?: boolean | undefined;
    analyticsType: string;
}

export const ArtifactGroup: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = observer((props) => {
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
            {showMoreDownloadsHeading && <div>More downloads</div>}
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
                `}
            >
                {[
                    {
                        icon: pdfIcon,
                        alt: "Download PDF",
                        type: ArtifactType.pdf,
                        settings: pdfSettings,
                        enabled: pdfSettings?.decision === true,
                        hidden: hidePdfButton,
                        analyticsType: "pdf",
                    },
                    {
                        icon: ePUBIcon,
                        alt: "Download ePUB",
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
                        alt:
                            "Download BloomPUB for Bloom Reader or BloomPub Viewer",
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
                                    a.settings?.reasonForHiding(props.book) ||
                                    a.alt
                                }
                                arrow={true}
                            >
                                <IconButton
                                    onClick={() => {
                                        const params = getBookAnalyticsInfo(
                                            props.book,
                                            props.contextLangIso,
                                            a.analyticsType
                                        );
                                        track("Download Book", params);
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
                                    <a
                                        href={artifactUrl}
                                        // prevents page reloading!
                                        download={fileName}
                                        key={a.alt}
                                    >
                                        <img src={a.icon} alt={a.alt} />
                                    </a>
                                </IconButton>
                            </Tooltip>
                        )
                    );
                })}
            </ul>
        </div>
    );
});
