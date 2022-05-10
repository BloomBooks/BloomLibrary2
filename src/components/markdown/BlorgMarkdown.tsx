// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Children } from "react";
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

// This class is configured to be automatically substituted when the markdown interpreter would otherwise create
// a <p>. By default it simply renders a <p> with the same props. However, if it has exactly one child which is
// an image, it applies the class image-container to the paragraph, which by default centers that image.
// Also, it looks to see whether the image has a title starting with a period. If so, whatever follows the period
// up to the first space is removed from the title and applied to the paragraph as a class. Currently we only support
// .left, which suppresses the centering.
// Thus, currently the markdown
// ![AfghanUI](//...somepath/AfghanUI.png "Afghan children")
// will produce a centered AfghanUI.png with alt "AfghanUI" and title (hover popup) "Afghan childern".
// ![AfghanUI](//...somepath/AfghanUI.png ".left Afghan children")
// will produce the same except the image is not centered.
const ImgInParaAdjuster: React.FunctionComponent = (props) => {
    const children = Children.toArray(props.children);
    const firstChild: any = children[0];
    const gotExactlyOneChildThatIsImg =
        firstChild && firstChild.type === "img" && children.length === 1;
    if (gotExactlyOneChildThatIsImg) {
        let paraClass: string = firstChild.props.title ?? "";
        let title = paraClass;
        if (paraClass && paraClass.startsWith(".")) {
            let spaceIndex = paraClass.indexOf(" ");
            if (spaceIndex === -1) {
                spaceIndex = paraClass.length;
            }
            title = paraClass.substring(spaceIndex + 1);
            paraClass = paraClass.substring(1, spaceIndex);
        } else {
            paraClass = "";
        }
        return (
            <p className={"image-container " + paraClass}>
                <img
                    src={firstChild.props.src}
                    alt={firstChild.props.alt}
                    title={title}
                />
            </p>
        );
    }
    // not a one-image paragraph, return exactly the paragraph that would have been shown without the substitution.
    return <p {...props}>{props.children}</p>;
};

export const BlorgMarkdown: React.FunctionComponent<{
    markdown: string;
    column?: TwoColumn;
}> = (props) => {
    const options = {
        overrides: {
            a: {
                component: BlorgLink,
            },
            p: {
                component: ImgInParaAdjuster,
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
            css={css`
                .image-container:not(.left) {
                    display: flex;
                    justify-content: center;
                }
            `}
        >
            <Markdown options={options}>{props.markdown}</Markdown>
        </div>
    );
};
