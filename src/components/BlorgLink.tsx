import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link as MuiLink } from "@material-ui/core";
//import OpenInNewIcon from "@material-ui/icons/OpenInNew";

// for a discussion around how react-router link doesn't handle
// external links, see https://github.com/ReactTraining/react-router/issues/1147

export interface IBlorgLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string; // href is part of React.AnchorHTMLAttributes<HTMLAnchorElement> but optional; we want required
    newTabIfEmbedded?: boolean;
    alwaysnewtab?: boolean;
    color?: "primary" | "secondary";
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

    // const propsToPassDown = {
    //     href: props.href,
    //     css: props.css,
    //     color: props.color,
    //     onClick: props.onClick,
    //     role: props.role,
    // };

    // ABOUT MuiLink: we're using this to get the themed color for the link

    if (isExternalOrEmail(props.href as string)) {
        // Open a new tab if appropriate
        if (props.alwaysnewtab || (isInIframe && props.newTabIfEmbedded)) {
            return (
                // @ts-ignore:next-line
                <MuiLink
                    target={"_blank"}
                    rel="noopener noreferrer"
                    {...propsToPassDown}
                    color={props.color || "primary"}
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
                // @ts-ignore:next-line
                <MuiLink
                    {...propsToPassDown}
                    target={props.target}
                    color={props.color || "primary"}
                >
                    <div>"hello"</div>
                </MuiLink>
            );
        }
    }

    const query = new URLSearchParams(location.search);
    const queryComponent = getLinkUrlQueryComponent(query);

    let to = props.href + queryComponent;
    if (!to.startsWith("/")) {
        /* The initial slash keeps url from just being 'tacked on' to existing url; not what we want here. */
        to = `/${to}`;
    }
    // This is just to get typescript to allow the MuiLink below.
    // We think we have some mismatch in the library or react type definitions somewhere.
    // const WrapRouterLink: React.FunctionComponent<{}> = () => (
    //     <React.Fragment>
    //         <RouterLink to={to}></RouterLink>
    //     </React.Fragment>
    // );

    //  Types of property 'referrerPolicy' are incompatible. https://github.com/mui/material-ui/issues/15299
    function WorkAroundLink(
        props: React.DetailedHTMLProps<
            React.AnchorHTMLAttributes<HTMLAnchorElement>,
            HTMLAnchorElement
        >,
        // props: React.DetailedHTMLProps<
        //     React.AnchorHTMLAttributes<HTMLAnchorElement>,
        //     HTMLAnchorElement
        // >,
        ref: React.Ref<HTMLAnchorElement>
    ) {
        return (
            // @ts-ignore:next-line   work around 'defaultValue' type incompatibility
            <RouterLink ref={ref} to={props.href || ""} {...propsToPassDown}>
                {props.children}
            </RouterLink>
            // <a href="foo" defaultValue={"foo"} referrerPolicy="origin">
            //     h
            // </a>
        );
    }
    return (
        // @ts-ignore:next-line  To get it to accept the WorkAroundLink (types of referrerPolicy are incompatible)
        <MuiLink
            {...propsToPassDown}
            component={WorkAroundLink}
            color={props.color || "primary"}
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

// Returns the query component (the part including/after the question mark) of the URL to pass to MuiLink's "to" parameter
function getLinkUrlQueryComponent(query: URLSearchParams): string {
    // Currently the url query contains nothing other than the params we need to forward
    // from the current page to the new page
    const queryParams = getQueryParamsToForward(query);
    if (queryParams) {
        return "?" + queryParams;
    } else {
        return "";
    }
}

// Returns (as a string) the query parameters that should be forwarded from the current page to the next page
// Parameters beginning with "bl-" are defined as those to be forwarded
function getQueryParamsToForward(
    query: URLSearchParams // the current query parameters
): string {
    const params: string[] = [];
    query.forEach((value, key) => {
        if (key.startsWith("bl-")) {
            params.push(`${key}=${value}`);
        }
    });

    const paramString = params.join("&");
    return paramString;
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
