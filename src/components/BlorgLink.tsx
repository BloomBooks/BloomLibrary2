import * as React from "react";
import { Link, LinkProps } from "react-router-dom";

// for a discussion around how react-router link doesn't handle
// external links, see https://github.com/ReactTraining/react-router/issues/1147

export const BlorgLink: React.FunctionComponent<LinkProps> = (props) => {
    return isExternal(props.to as string) ? (
        <a
            href={props.to as string}
            target={"_blank"}
            rel="noopener noreferrer"
            {...props}
        >
            {props.children}
        </a>
    ) : (
        <Link {...props} />
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
