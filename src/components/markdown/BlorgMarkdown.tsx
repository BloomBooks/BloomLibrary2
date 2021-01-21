// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "../BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import { Feature, FeatureGroup, FeatureMatrix } from "./FeatureMatrix";
import { BlorgLink } from "../BlorgLink";
import { Section } from "./Section";
import { Testimonial } from "./Testimonial";
import { Vimeo } from "./Vimeo";
import { Columns, Column } from "./Columns";
import { Button } from "./Button";
import { ContentfulImage, StoryImage } from "./ContentfulImage";

export enum TwoColumn {
    leftColumn,
    rightColumn,
}

export const BlorgMarkdown: React.FunctionComponent<{
    markdown: string;
    column?: TwoColumn;
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
            Section,
            Testimonial,
            Columns,
            Column,
            Vimeo,
            Button,
            Image: ContentfulImage,
            StoryImage,
        },
    };

    return (
        <div
            className={`contentful-markdown-part ${
                props.column === TwoColumn.rightColumn ? "rightColumn" : ""
            }`}
        >
            <Markdown options={options}>{props.markdown}</Markdown>
        </div>
    );
};
