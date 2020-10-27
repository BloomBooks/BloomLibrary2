import React from "react";
import Markdown from "markdown-to-jsx";
import { BloomReaderVersionNumber } from "./BloomReaderVersionNumber";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import Link from "@material-ui/core/Link";

export const ContentfulMarkdownPart: React.FunctionComponent<{
    markdown: string;
}> = (props) => {
    return React.createElement(Markdown, {
        options: {
            overrides: {
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
        },
        children: props.markdown,
    });
};
