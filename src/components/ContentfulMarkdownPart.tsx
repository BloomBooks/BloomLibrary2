import css from "@emotion/css/macro";
import React from "react";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "./BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import Link from "@material-ui/core/Link";
import { Feature, FeatureGroup, FeatureMatrix } from "./FeatureMatrix";

export enum Column {
    leftColumn,
    rightColumn,
}

export const ContentfulMarkdownPart: React.FunctionComponent<{
    markdown: string;
    column?: Column;
}> = (props) => {
    const options = {
        overrides: {
            a: {
                component: Link,
            },
            WindowsInstallerDownload,
            WindowsInstallerLink,
            BloomReaderVersionNumber,
            FeatureMatrix,
            Feature,
            FeatureGroup,
        },
    };

    // These next few lines setup CSS that differs by which column this "Part" is for.
    // "justification" handles vertical alignment. The left column needs to align to the top
    // and the right column looks better if it's centered vertically.
    // "alignment" handles the horizontal alignment. The left column needs to align left and
    // the right columns needs to be center aligned.
    const flexValue = !props.column ? 1 : 1;
    const justification = !props.column ? "start" : "center";
    const alignment = !props.column ? "flex-start" : "center";
    const leftPadding = !props.column ? "0" : "40px";

    return (
        <div
            css={css`
                /* display: flex;
                flex-direction: column;
                flex: ${flexValue};
                justify-content: ${justification};
                align-items: ${alignment};
                padding-right: 20px;
                padding-left: ${leftPadding}; */
            `}
        >
            <Markdown options={options}>{props.markdown}</Markdown>
        </div>
    );
};
