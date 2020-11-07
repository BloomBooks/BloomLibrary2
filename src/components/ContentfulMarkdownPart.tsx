import React from "react";
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "./BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import Link from "@material-ui/core/Link";
import { Feature, FeatureGroup, FeatureMatrix } from "./pages/FeatureMatrix";
import { QuoteCard, QuoteSource, Quote } from "./pages/QuoteCard";

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
            QuoteCard,
            Quote,
            QuoteSource,
        },
    };

    return (
        <div
            className={`contentful-markdown-part ${props.column === Column.rightColumn ? "rightColumn" : ""}`}
        >
            <Markdown
                options={options}
            >
                {props.markdown}
            </Markdown>
        </div>
    );
};
