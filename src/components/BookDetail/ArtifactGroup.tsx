// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import pdfIcon from "./PDF.svg";
import ePUBIcon from "./ePUB.svg";
import bloomReaderIcon from "./BloomPub.svg";

import { IconButton, Tooltip } from "@material-ui/core";
import {
    getArtifactUrl,
    ArtifactType,
    getArtifactVisibilitySettings
} from "./ArtifactHelper";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
export const ArtifactGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    const { bloomReaderAvailable, cantUseBloomD } = useContext(
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
    const haveABloomDToDownload = bloomReaderSettings?.decision;
    // If bloom reader is available for this device and we have a bloomd, a more prominent button is shown elsewhere.
    const showingBloomReaderDownloadElsewhere =
        bloomReaderAvailable && haveABloomDToDownload;

    // We show the bloomD download button here if (a) we have one, and (b) we're not showing the larger
    // button elsewhere, and (c) we're not on a device (like an iphone) which we consider to have
    // no good reason to download it.
    const showBloomReaderButton =
        haveABloomDToDownload &&
        !showingBloomReaderDownloadElsewhere &&
        !cantUseBloomD;

    // If we're showing a bloomd download button elsewhere AND there are
    // some other downloads to offer here, we give them a heading to indicate
    // they are additional.
    const showMoreDownloadsHeading =
        showingBloomReaderDownloadElsewhere &&
        (pdfSettings.decision || epubSettings?.decision);
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
                        visible: pdfSettings.decision
                    },
                    {
                        icon: ePUBIcon,
                        alt: "Download ePUB",
                        type: ArtifactType.epub,
                        settings: epubSettings,
                        visible: epubSettings && epubSettings.decision
                    },
                    {
                        icon: bloomReaderIcon,
                        alt: "Download for Bloom Reader",
                        type: ArtifactType.bloomReader,
                        settings: bloomReaderSettings,
                        visible: showBloomReaderButton
                    }
                ].map(a => {
                    // console.log(
                    //     `alt:${a.alt}  settings:${JSON.stringify(
                    //         a.settings
                    //     )} reason:${a.settings?.reasonForHiding(props.book)}`
                    // );
                    return (
                        <Tooltip
                            key={a.alt}
                            aria-label={`${a.alt} is not available`}
                            title={
                                a.settings?.reasonForHiding(props.book) || ""
                            }
                            arrow={true}
                            disableHoverListener={a.visible}
                            disableFocusListener={a.visible}
                            disableTouchListener={a.visible}
                        >
                            <IconButton>
                                {!a.visible && (
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
                                    href={getArtifactUrl(props.book, a.type)}
                                    key={a.alt}
                                >
                                    <img src={a.icon} alt={a.alt} />
                                </a>
                            </IconButton>
                        </Tooltip>
                    );
                })}
            </ul>
        </div>
    );
});
