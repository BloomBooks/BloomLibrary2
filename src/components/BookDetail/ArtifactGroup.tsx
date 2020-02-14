// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
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
export const ArtifactGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
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
    return (
        <ul
            css={css`
                margin: 0;
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
                    visible: bloomReaderSettings && bloomReaderSettings.decision
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
    );
});
