import React from "react";
import { useContentful } from "../../connection/UseContentful";
import { useDocumentTitle } from "../Routes";
import { CreationThemeProvider } from "../../theme";
import { useLocation } from "react-router-dom";
import { convertContentfulMediaToIMedia } from "../../model/Contentful";
import { IMedia } from "../../model/ContentInterfaces";

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

export const ContentfulBasePage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    useDocumentTitle(props.urlKey);
    const inCreate =
        useLocation().pathname.toLowerCase().indexOf("create") > -1;

    if (inCreate) {
        return <CreationThemeProvider>{props.children}</CreationThemeProvider>;
    } else {
        return <React.Fragment>{props.children}</React.Fragment>;
    }
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
