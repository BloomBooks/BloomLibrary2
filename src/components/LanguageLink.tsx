// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";

import { Link } from "@material-ui/core";
import { RouterContext } from "../Router";

export const LanguageLink: React.FunctionComponent<{
    name: string;
    englishName?: string;
    isoCode: string;
}> = props => {
    const router = useContext(RouterContext);

    return (
        <Link
            color="secondary"
            title={props.englishName}
            onClick={() => {
                router!.push({
                    title: props.name,
                    pageType: "language",
                    filter: { language: props.isoCode }
                });
            }}
        >
            {props.name}
        </Link>
    );
};
