import React from "react";
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "../BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import { Feature, FeatureGroup, FeatureMatrix } from "./FeatureMatrix";
import { BlorgLink } from "../BlorgLink";
import { MarkdownBookCards } from "./MarkdownBookCards";
import { Section } from "./Section";
import { Testimonial } from "./Testimonial";
import { Vimeo } from "./Vimeo";
import { Columns, Column } from "./Columns";
import { Button } from "./Button";
import { AllBloomInstallers } from "./AllBloomInstallers";
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
            AllBloomInstallers,
            BookCards: MarkdownBookCards,
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
