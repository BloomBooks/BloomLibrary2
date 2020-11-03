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

export const ContentfulMarkdownPart: React.FunctionComponent<{
    markdown: string;
    flexValue: number;
}> = (props) => {
    const options =
        {overrides: {
                a: {
                    component: Link,
                },
                WindowsInstallerDownload: {
                    component: WindowsInstallerDownload,
                },
                WindowsInstallerLink: {
                    component: WindowsInstallerLink,
                },
                BloomReaderVersionNumber: {
                    component: BloomReaderVersionNumber,
                },
            },
        };

    const justification = props.flexValue === 2 ? "center" : "start";
    const alignment = props.flexValue === 2 ? "flex-end" : "flex-start";

    return (
        <div css=
            {css`
                display: flex;
                flex-direction: column;
                flex: ${props.flexValue};
                justify-content: ${justification};
                align-items: ${alignment};
                padding-right: 20px;`}>
            <Markdown
                options={options}
            >
                {props.markdown}
            </Markdown>
        </div>
    );
};
