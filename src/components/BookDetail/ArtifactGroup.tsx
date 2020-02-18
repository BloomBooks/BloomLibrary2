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

import { IconButton } from "@material-ui/core";
import {
    getArtifactUrl,
    ArtifactType,
    getArtifactVisibilitySettings
} from "./ArtifactHelper";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
export const ArtifactGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    const { bloomReaderAvailable } = useContext(OSFeaturesContext);
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
    // If bloom reader is available for this device, a more prominent button is shown elsewhere.
    // So we don't show that button here. And of course we only show it if the harvester
    // was able to make one and no one has decided not to show it.
    const showBloomReaderButton =
        bloomReaderSettings?.decision && !bloomReaderAvailable;
    // If the bloom reader is available for the device and a bloomd is available for the book,
    // then we're showing a main download button elsewhere. Iff there are
    // some other downloads to offer here, we give them a heading to indicate
    // they are additional.
    const showMoreDownloadsHeading =
        bloomReaderAvailable &&
        bloomReaderSettings?.decision &&
        (pdfSettings.decision || epubSettings?.decision);
    return (
        <div>
            {showMoreDownloadsHeading && <div>More downloads</div>}
            <ul
                // margin-left defeats the padding built into mui-buttons, so the
                // row can be left-aligned
                // margin-top defeats most of the mui padding to bring the buttons closer
                // to the heading if there is one.
                css={css`
                    margin: 0;
                    margin-left: -12px;
                    margin-top: ${showMoreDownloadsHeading ? "-10px" : "0"};
                `}
            >
                {[
                    {
                        icon: pdfIcon,
                        alt: "Download PDF",
                        type: ArtifactType.pdf,
                        visible: pdfSettings.decision
                    },
                    {
                        icon: ePUBIcon,
                        alt: "Download ePUB",
                        type: ArtifactType.epub,
                        visible: epubSettings && epubSettings.decision
                    },
                    {
                        icon: bloomReaderIcon,
                        alt: "Download for Bloom Reader",
                        type: ArtifactType.bloomReader,
                        visible: showBloomReaderButton
                    }
                ].map(
                    a =>
                        a.visible && (
                            <a
                                href={getArtifactUrl(props.book, a.type)}
                                key={a.alt}
                                //target={isInternalUrl() ? undefined : "_blank"}
                            >
                                <IconButton>
                                    <img src={a.icon} alt={a.alt} />
                                </IconButton>
                            </a>
                        )
                )}
            </ul>
        </div>
    );
});
