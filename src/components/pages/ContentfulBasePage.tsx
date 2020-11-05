import React from "react";
import { useContentful } from "../../connection/UseContentful";
import { useDocumentTitle } from "../Routes";
import { CreationThemeProvider } from "../../theme";
import { useLocation } from "react-router-dom";

export interface IContentfulPage {
    urlKey: string,
}

export const ContentfulBasePage: React.FunctionComponent<IContentfulPage> = (
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

export function useContentfulPage(contentType: string, urlKey: string): any | null {
    const { loading, result: data } = useContentful({
        content_type: `${contentType}`,
        "fields.urlKey": `${urlKey}`,
        include: 10,
    });

    if (loading || !data) {
        return null;
    }

    if (!data || data.length === 0) {
        throw Error("404: " + urlKey);
    }

    return data[0];
}
