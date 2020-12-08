import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@material-ui/core";
//import OpenInNewIcon from "@material-ui/icons/OpenInNew";

// for a discussion around how react-router link doesn't handle
// external links, see https://github.com/ReactTraining/react-router/issues/1147

export interface IBlorgLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    newTabIfEmbedded?: boolean;
    color?: "primary" | "secondary";
}

export const BlorgLink: React.FunctionComponent<IBlorgLinkProps> = (props) => {
    const isInIframe = window.self !== window.top;

    const { newTabIfEmbedded, ...propsToPassDown } = props; // Prevent React warnings

    // ABOUT MuiLink: we're using this to get the themed color for the link

    return isExternal(props.href as string) ||
        (isInIframe && props.newTabIfEmbedded) ? (
        // We've decided for now to always open a new tab for external websites.
        // Some links should open a new tab if we are embedded in an iframe.
        <MuiLink
            target={"_blank"}
            rel="noopener noreferrer"
            {...propsToPassDown}
            color={props.color || "primary"}
        >
            {props.children}
            {/* This might be a nice thing to do, but the color wasn't actually being applied (the css was there, but the svg didn't take it on)
            {" "}
            <OpenInNewIcon
                color="primary"
                css={css`
                    vertical-align: bottom;
                    font-size: 12pt !important;
                `}
            ></OpenInNewIcon> */}
        </MuiLink>
    ) : (
        <MuiLink
            {...propsToPassDown}
            component={RouterLink}
            to={props.href!}
            color={props.color || "primary"}
        >
            {props.children}
        </MuiLink>
    );
};

function isExternal(url: string): boolean {
    try {
        // if it doesn't start with http, let's say it is internal
        if (!url.startsWith("http")) return false;
        // if it does, it could still be pointing to this site
        const urlObj = new URL(url, window.location.origin);
        return urlObj.hostname !== window.location.hostname;
    } catch {
        console.error(`isExternal() could not parse ${url}`);
        return false;
    }
}
