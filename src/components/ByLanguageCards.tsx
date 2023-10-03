// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CachedTables } from "../model/CacheProvider";
import { getDisplayNamesFromLanguageCode } from "../model/Language";
import { ICollection } from "../model/ContentInterfaces";
import { CollectionCard, CollectionCardLayout } from "./CollectionCard";
import { getFilterForCollectionAndChildren } from "../model/Collections";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { useGetLanguagesWithTheseBooks } from "./ByLanguageGroups";
import { setBloomLibraryTitle } from "./Routes";

// Lays out a collection by displaying one language card per language in the collection.
// When a card is clicked, a virtual collection is displayed which is the original collection
// filtered by language.
// Use this layout by setting the CollectionLayout in Contentful to "by-language-cards".
// See https://bloomlibrary.org/bible/Bible-for-Children for an example.
export const ByLanguageCards: React.FunctionComponent<{
    collection: ICollection;
    reportBooksAndLanguages?: (bookCount: number, langCount: number) => void;
}> = (props) => {
    const { waiting, languagesWithTheseBooks } = useGetLanguagesWithTheseBooks(
        props.collection,
        props.reportBooksAndLanguages
    );

    if (waiting) {
        return <React.Fragment />;
    }

    const languageCollectionCards = languagesWithTheseBooks.map((l) => (
        <CollectionCard
            key={l.isoCode}
            collection={makeVirtualCollectionOfBooksInCollectionThatHaveLanguage(
                props.collection,
                l.isoCode
            )}
            layout={CollectionCardLayout.iconAndBookCount}
        ></CollectionCard>
    ));

    return (
        <div
            css={css`
                display: flex;
                flex-wrap: wrap;
            `}
        >
            {languageCollectionCards}
        </div>
    );
};

export function makeVirtualCollectionOfBooksInCollectionThatHaveLanguage(
    baseCollection: ICollection,
    languageCode: string,
    isForCollectionPage: boolean = false
): ICollection {
    const languageNames = getDisplayNamesFromLanguageCode(
        languageCode,
        // The proper way to get the cached languages is with useContext(CachedTablesContext),
        // but we aren't in a hook, and we would have to pass the languages down through
        // multiple layers. This seems to always work even when loading the page fresh.
        CachedTables.languagesByBookCount
    );

    const localizedCollectionName = getLocalizedCollectionLabel(baseCollection);
    let label = languageNames?.combined || languageCode;
    if (label && isForCollectionPage)
        label = `${localizedCollectionName} - ${label}`;

    // This is a hack. The first time or three through here, we might not have the language information yet.
    // So when we set the page title initially, it might be something like "My Collection - en".
    // But we will end up coming back through eventually with the language information. So then we set it to "My Collection - English".
    if (isForCollectionPage) setBloomLibraryTitle(label);

    const baseCollectionFilter =
        baseCollection.filter ??
        getFilterForCollectionAndChildren(baseCollection);
    return {
        ...baseCollection,
        iconForCardAndDefaultBanner: undefined, // Gives us the default books icon instead of the collection's icon for every language card
        filter: { ...baseCollectionFilter, language: languageCode },
        label,
        title: label,
        urlKey: baseCollection.urlKey + "/:language:" + languageCode,
        layout: "all-books",
    };
}
