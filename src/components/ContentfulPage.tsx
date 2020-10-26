import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useContentful } from "../connection/UseContentful";
import { useDocumentTitle } from "./Routes";
import Markdown from "markdown-to-jsx";
import { WindowsInstallerDownload } from "./WindowsInstallerDownload";
import { WindowsInstallerLink } from "./WindowsInstallerLink";
import { BloomReaderVersionNumber } from "./BloomReaderVersionNumber";
import { CreationThemeProvider } from "../theme";
import Link from "@material-ui/core/Link";
import { useLocation } from "react-router-dom";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    useDocumentTitle(props.urlKey);
    const inCreate =
        useLocation().pathname.toLowerCase().indexOf("create") > -1;

    const { loading, result: data } = useContentful({
        content_type: "page",
        "fields.urlKey": `${props.urlKey}`,
        include: 10,
    });
    if (loading || !data) {
        return null;
    }

    if (!data || data.length === 0) {
        throw Error("404: " + props.urlKey);
    }

    const page = data[0];
    const markdownContent = page.fields.markdownBody as string;
    const innards = (
        <div
            css={css`
                max-width: 1000px;
                margin-left: 30px;
                margin-right: 30px;
                h1 {
                    font-size: 2rem;
                }
                img {
                    width: 200px;
                }
            `}
        >
            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {markdownContent
                ? React.createElement(Markdown, {
                      options: {
                          overrides: {
                              a: {
                                  component: Link,
                              },
                              WindowsInstallerLink: {
                                  component: WindowsInstallerLink,
                              },
                              WindowsInstallerDownload: {
                                  component: WindowsInstallerDownload,
                              },
                              BloomReaderVersionNumber: {
                                  component: BloomReaderVersionNumber,
                              },
                          },
                      },
                      children: markdownContent,
                  })
                : documentToReactComponents(page.fields.body)}
        </div>
    );

    if (inCreate) {
        return <CreationThemeProvider>{innards}</CreationThemeProvider>;
    } else {
        return <React.Fragment>{innards}</React.Fragment>;
    }
};
