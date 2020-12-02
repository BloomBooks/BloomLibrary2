import * as React from "react";
import { Link } from "react-router-dom";

// for a discussion around how react-router link doesn't handle
// external links, see https://github.com/ReactTraining/react-router/issues/1147

export interface IBlorgLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    newTabIfEmbedded?: boolean;
}

export const BlorgLink: React.FunctionComponent<IBlorgLinkProps> = (props) => {
    const isInIframe = window.self !== window.top;
    return isExternal(props.href as string) ||
        (isInIframe && props.newTabIfEmbedded) ? (
        // We've decided for now to always open a new tab for external websites.
        // Some links should open a new tab if we are embedded in an iframe.
        <a target={"_blank"} rel="noopener noreferrer" {...props}>
            {props.children}
        </a>
    ) : (
        <Link to={props.href!} {...props} />
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
