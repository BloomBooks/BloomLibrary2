import React from "react";
import { useSetBrowserTabTitle } from "../Routes";
import { ResourcesThemeProvider } from "../../theme";
import { useLocation } from "react-router-dom";

export const ThemeForLocation: React.FunctionComponent<{
    browserTabTitle: string;
}> = (props) => {
    useSetBrowserTabTitle(props.browserTabTitle);

    if (isInResourcesSectionOfSite(useLocation().pathname)) {
        return (
            <ResourcesThemeProvider>{props.children}</ResourcesThemeProvider>
        );
    } else {
        return <React.Fragment>{props.children}</React.Fragment>;
    }
};

// Use the pathname portion of the url to determine if we are in the resources section of the site.
// Example urls:
// - /resources
// - /resources/book/abc123/resources
// - /page/resources/page/about
// - /page/resources/creators-Chetana
// We don't want to match something like
// - /resources-for-the-blind
export function isInResourcesSectionOfSite(urlPathname: string): boolean {
    if (!urlPathname) return false;

    if (urlPathname === "/create") return true;

    return urlPathname.includes("/create/");
}

export function isOnAboutPage(urlPathname: string): boolean {
    if (!urlPathname) return false;

    return urlPathname.endsWith("/about");
}
