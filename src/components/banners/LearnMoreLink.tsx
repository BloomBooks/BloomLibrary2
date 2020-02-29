import React from "react";

export const LearnMoreLink: React.FunctionComponent<{
    href: string;
}> = props => (
    <React.Fragment>
        <a target="_blank" rel="noopener noreferrer" href={props.href}>
            Learn More
        </a>
    </React.Fragment>
);
