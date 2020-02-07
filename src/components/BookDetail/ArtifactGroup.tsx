// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import pdfIcon from "./PDF.svg";
import ePUBIcon from "./ePUB.svg";
import bloomReaderIcon from "./BloomPub.svg";

import { IconButton } from "@material-ui/core";
import { getArtifactUrl, ArtifactType } from "./ArtifactHelper";
export const ArtifactGroup: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
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
                    visible: true
                },
                {
                    icon: ePUBIcon,
                    alt: "Download ePUB",
                    type: ArtifactType.epub,
                    visible: props.book.ePUBVisible
                },
                {
                    icon: bloomReaderIcon,
                    alt: "Download for Bloom Reader",
                    type: ArtifactType.bloomReader,
                    visible: true
                }
            ].map(
                a =>
                    a.visible && (
                        <a
                            href={getArtifactUrl(props.book, a.type)}
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
