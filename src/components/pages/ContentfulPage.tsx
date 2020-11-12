import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ThemeForLocation } from "./ThemeForLocation";
import { ContentfulMarkdownPart } from "../ContentfulMarkdownPart";
import Container from "@material-ui/core/Container";
import { convertContentfulMediaToIMedia } from "../../model/Contentful";
import { IMedia } from "../../model/ContentInterfaces";
import { useContentful } from "../../connection/UseContentful";

export interface IContentfulPage {
    urlKey: string;
    // The text label we show on the card
    label: string;
    markdownBody: string;

    // A sentence that is shown when we're showing a story card
    excerpt?: string;
    // A card that  is shown when we're showing a story card
    cardImage?: IMedia;
    // A grey-text like the name of the country or some other topic for stories
    category: string;

    // NB: purposefully missing here are "body" and "parts" which are probably going away.
    // For now, those can be accessed via the raw fields tag
    fields: any;
}

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    const page = useContentfulPage("page", props.urlKey);
    if (!page) {
        return null;
    }

    // This feels like a bit of a hack, but I'm not sure what we want to do.
    // Note that strictly, we're just looking for something starting with an h1,
    // which could be something other than the title.
    const titleIfDocDoesNotSeemToHaveOne =
        page.markdownBody && !page.markdownBody.startsWith("#") ? (
            <h1>{page.label}</h1>
        ) : undefined;

    const innards = (
        <div className={`base-contentful-page contentful-page ${props.urlKey}`}>
            {titleIfDocDoesNotSeemToHaveOne}

            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {page.markdownBody ? (
                <ContentfulMarkdownPart markdown={page.markdownBody} />
            ) : (
                documentToReactComponents(page.fields.body)
            )}
        </div>
    );

    return (
        <Container maxWidth="md">
            <ThemeForLocation urlKey={props.urlKey}>{innards}</ThemeForLocation>
        </Container>
    );
};

export function useContentfulPage(
    contentType: string,
    urlKey: string
): IContentfulPage | undefined {
    const { loading, result: data } = useContentful({
        content_type: `${contentType}`,
        "fields.urlKey": `${urlKey}`,
        include: 10,
    });

    if (loading || !data) {
        return undefined;
    }

    if (!data || data.length === 0) {
        throw Error("404: " + urlKey);
    }
    const p = data[0];
    if (!p) {
        return undefined;
    }
    return {
        urlKey: p.fields.urlKey,
        label: p.fields.label,
        markdownBody: p.fields.markdownBody,
        fields: p.fields,
        // the following are used when we are showing a "story card" (like for blog posts)
        cardImage: p.fields.iconForCardAndDefaultBanner
            ? convertContentfulMediaToIMedia(
                  p.fields.iconForCardAndDefaultBanner // note, despite the name,this isn't necessarily an icon... can be any image
              )
            : undefined,
        excerpt: p.fields.excerpt,
        category: p.fields.category,
    };
}
