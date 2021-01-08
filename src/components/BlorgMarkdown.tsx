// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "./BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import { Feature, FeatureGroup, FeatureMatrix } from "./FeatureMatrix";
import { BlorgLink } from "./BlorgLink";
import { ColoredBlock } from "./ColoredBlock";

export enum Column {
    leftColumn,
    rightColumn,
}

export const BlorgMarkdown: React.FunctionComponent<{
    markdown: string;
    column?: Column;
}> = (props) => {
    const options = {
        overrides: {
            a: {
                component: BlorgLink,
            },
            WindowsInstallerDownload,
            WindowsInstallerLink,
            BloomReaderVersionNumber,
            FeatureMatrix,
            Feature,
            FeatureGroup,
            ColoredBlock,
        },
    };

    return (
        <div
            css={css`
                img {
                    // prevent images in stories from being wider than the container
                    max-width: 100%;
                    // Conceivably these rules should only apply to stories? If they start to
                    // mess up other kinds of pages, then we can deal with that.
                    margin-top: 14px;
                    margin-bottom: 14px;
                    display: block; // makes the following centering rules work
                    margin-left: auto;
                    margin-right: auto;
                }
            `}
            className={`contentful-markdown-part ${
                props.column === Column.rightColumn ? "rightColumn" : ""
            }`}
        >
            <Markdown options={options}>{props.markdown}</Markdown>
        </div>
    );
};
