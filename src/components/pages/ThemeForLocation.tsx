import React from "react";
import { useSetBrowserTabTitle } from "../Routes";
import { CreationThemeProvider } from "../../theme";
import { useLocation } from "react-router-dom";

export const ThemeForLocation: React.FunctionComponent<{
    browserTabTitle: string;
}> = (props) => {
    useSetBrowserTabTitle(props.browserTabTitle);

    if (isInCreateSectionOfSite(useLocation().pathname)) {
        return <CreationThemeProvider>{props.children}</CreationThemeProvider>;
    } else {
        return <React.Fragment>{props.children}</React.Fragment>;
    }
};

// Use the pathname portion of the url to determine if we are in the create section of the site.
// Example urls:
// - /create
// - /create/book/abc123/create
// - /page/create/page/about
// - /page/create/creators-Chetana
// We don't want to match something like
// - /create-seeds
export function isInCreateSectionOfSite(urlPathname: string): boolean {
    if (!urlPathname) return false;

    if (urlPathname === "/create") return true;

    return urlPathname.includes("/create/");
}
