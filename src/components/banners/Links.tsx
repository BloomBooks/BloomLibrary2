import React from "react";

export const WikipediaLink: React.FunctionComponent<{
    text: string;
    // in case 'text' would give an ambiguous query
    query?: string;
}> = props => (
    <React.Fragment>
        {/* We're intentionally using <a> instead of <Link> because we tend to need the underline once we apply a color;
        the <Link> is really just about auto-applying theme colors. */}
        <a
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            href={`https://en.wikipedia.org/w/index.php?search=${props.query ||
                props.text.replace(/\s/g, "_")}`}
        >
            {props.text}
        </a>
    </React.Fragment>
);
