import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link as MuiLink } from "@material-ui/core";
//import OpenInNewIcon from "@material-ui/icons/OpenInNew";

// for a discussion around how react-router link doesn't handle
// external links, see https://github.com/ReactTraining/react-router/issues/1147

export interface IBlorgLinkProps {
    // we'd prefer this extends but mismatching definitions have killed it for now
    //extends React.AnchorHTMLAttributes<HTMLAnchorElement>
    onClick?: (e: any) => void;
    target?: string;
    className?: string;
    role?: string;
    title?: string;
    href: string; // href is part of React.AnchorHTMLAttributes<HTMLAnchorElement> but optional; we want required
    newTabIfEmbedded?: boolean;
    alwaysnewtab?: boolean;
    color?: "primary" | "secondary";
    onMouseDown?: () => void;
    onMouseUp?: () => void;
}

// A Link class that is clever about using a React Router Link for internal hrefs and
// a regular one for external ones, and in a few other ways.
// Since it's all about handling the href, that is deliberately not optional.
// If you want something that looks like a link but is really a button (as should be
// done if there isn't an href, according to accessibility rules), you can use
// a MUI Link with component="button" (example in LicenseLink.tsx).
export const BlorgLink: React.FunctionComponent<IBlorgLinkProps> = (props) => {
    const location = useLocation();

    const isInIframe = window.self !== window.top;

    /* REVIEW: this is causing problems... something is sneaking through that we don't want:*/
    const { newTabIfEmbedded, alwaysnewtab, ...propsToPassDown } = props; // Prevent React warnings

    // ABOUT MuiLink: we're using this to get the themed color for the link

    if (isExternalOrEmail(props.href as string)) {
        // Open a new tab if appropriate
        if (props.alwaysnewtab || (isInIframe && props.newTabIfEmbedded)) {
            return (
                <MuiLink
                    target={"_blank"}
                    rel="noopener noreferrer"
                    {...propsToPassDown}
                    color={props.color || "primary"}
                    onMouseDown={props.onMouseDown}
                    onMouseUp={props.onMouseUp}
                    underline="none"
                >
                    {props.children}
                    {/* This might be a nice thing to do, but the color wasn't actually being applied (the css was there, but the svg didn't take it on)
            <OpenInNewIcon
                color="primary"
                css={css`
                    vertical-align: bottom;
                    font-size: 12pt !important;
                `}
            ></OpenInNewIcon> */}
                </MuiLink>
            );
        } else {
            // It is tempting to open a new tab when the link is to an external site. One can imagine that this less confusing. On mobile, it's clearly
            // more confusing, since you don't see the new tab and now "back" doesn't work. On Desktop, it's less clear, so I'm erroring on the side of
            // the Nielsen Norman Group: https://www.nngroup.com/articles/new-browser-windows-and-tabs/
            return (
                // just a normal <a></a> element, styled to fit the theme
                <MuiLink
                    {...propsToPassDown}
                    target={props.target}
                    color={props.color || "primary"}
                    onMouseDown={props.onMouseDown}
                    onMouseUp={props.onMouseUp}
                    underline="none"
                >
                    {props.children}
                </MuiLink>
            );
        }
    }

    let to = props.href;
    if (location.search) {
        const queryParamsToForward = getQueryParamsToForward(
            new URLSearchParams(location.search)
        );

        const separator = props.href.includes("?") ? "&" : "?";
        to += separator + queryParamsToForward.toString();
    }

    if (!to.startsWith("/")) {
        /* The initial slash keeps url from just being 'tacked on' to existing url; not what we want here. */
        to = `/${to}`;
    }
    return (
        <MuiLink
            className={props.className}
            component={RouterLink}
            to={to}
            color={props.color || "primary"}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            underline="none"
        >
            {props.children}
        </MuiLink>
    );
};

function isExternalOrEmail(url: string): boolean {
    return url.startsWith("http") || url.startsWith("mailto:");

    // This was the previous version of this code.
    // It attempted to ensure we didn't reload our SPA
    // when navigating to an internal link with a full url.
    // But it got broken downstream sometime later, and now
    // we feel it is best to just have the simple check above.
    // try {
    //     // if it doesn't start with http or mailto, let's say it is internal
    //     if (!url.startsWith("http") && !url.startsWith("mailto:")) return false;
    //     // if it does, it could still be pointing to this site
    //     const urlObj = new URL(url, window.location.origin);
    //     return urlObj.hostname !== window.location.hostname;
    // } catch {
    //     console.error(`isExternal() could not parse ${url}`);
    //     return false;
    // }
}

// Returns the query parameters that should be forwarded from the current page to the next page
// Parameters beginning with "bl-" are defined as those to be forwarded.
// In addition, we keep the "formats" parameter.
//   This is used by SPApp to indicate it wants to download .bloomsource files.
//   They set it when initially navigating to the landing page, and we want to keep it.
function getQueryParamsToForward(
    query: URLSearchParams // the current query parameters
): URLSearchParams {
    const paramsToForward = new URLSearchParams();
    query.forEach((value, key) => {
        if (key.startsWith("bl-") || key === "formats") {
            paramsToForward.set(key, value);
        }
    });

    return paramsToForward;
}

export function addParamToUrl(url: string, key: string, value: string): string {
    const urlObject = new URL(url);
    const params = urlObject.searchParams;
    params.set(key, value);
    return urlObject.toString();
}

export function addExternalParamToUrl(url: string): string {
    return addParamToUrl(url, "external", "true");
}
