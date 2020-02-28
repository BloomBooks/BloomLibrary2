import React from "react";

// Open a new tab when this is clicked
export const ExternalLink: React.FunctionComponent<{
    href: string;
}> = props => (
    <React.Fragment>
        <a target="_blank" rel="noopener noreferrer" href={props.href}>
            {props.children}
        </a>
    </React.Fragment>
);
