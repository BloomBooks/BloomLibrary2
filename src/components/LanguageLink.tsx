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

// filter the list to contain only one out of any group that have the same
// display name.
// I'm sure there's a more efficient way to do this, but this approach
// gives the same sequence of names as getLanguageNames() and avoids
// needing to change the existing method.
export function getUniqueLanguages(languages: ILanguage[]): ILanguage[] {
    const result: ILanguage[] = [];
    for (const name of getLanguageNames(languages)) {
        result.push(languages.filter(l => getNameDisplay(l) === name)[0]);
    }
    return result;
}

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
export function getNameDisplay(l: ILanguage) {
    // Intentionally not making these a link, for now
    return `${l.name}${
        l.englishName && l.englishName !== l.name
            ? " (" + l.englishName + ")"
            : ""
    }`;
}
