import React from "react";
import { useSetBrowserTabTitle } from "../Routes";
import { CreationThemeProvider } from "../../theme";
import { useLocation } from "react-router-dom";

export const ThemeForLocation: React.FunctionComponent<{
    browserTabTitle: string;
}> = (props) => {
    useSetBrowserTabTitle(props.browserTabTitle);

    if (isInCreate(useLocation().pathname)) {
        return <CreationThemeProvider>{props.children}</CreationThemeProvider>;
    } else {
        return <React.Fragment>{props.children}</React.Fragment>;
    }
};

export function isInCreate(pathname: string): boolean {
    if (!pathname) return false;

    return pathname.indexOf("/create") > -1;
}
