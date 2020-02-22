// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

export const Wikipedia: React.FunctionComponent<{
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
