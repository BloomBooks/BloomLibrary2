// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";

import { Link } from "@material-ui/core";
import { RouterContext } from "../Router";
import { ILanguage } from "../model/Language";

export const LanguageLink: React.FunctionComponent<{
    language: ILanguage;
}> = props => {
    const router = useContext(RouterContext);
    const displayName = getNameDisplay(props.language);
    return (
        <Link
            color="secondary"
            onClick={() => {
                router!.push({
                    title: displayName,
                    pageType: "language",
                    filter: { language: props.language.isoCode }
                });
            }}
        >
            {displayName}
        </Link>
    );
};

export function getLanguageNames(languages: ILanguage[]): string[] {
    return languages
        ? Array.from(
              // This `from()` and `Set()` removes duplicates, which
              // we get if there are multiple scripts for the same language in the book
              new Set(languages.map(getNameDisplay))
          )
        : [];
}

// For languages where the name differs in English, we are currently
// showing the autonym followed by English in parentheses.
function getNameDisplay(l: ILanguage) {
    // Intentionally not making these a link, for now
    return `${l.name}${
        l.englishName && l.englishName !== l.name
            ? " (" + l.englishName + ")"
            : ""
    }`;
}
