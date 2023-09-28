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
            collection={makeCollectionForLanguage(props.collection, l.isoCode)}
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

export function makeCollectionForLanguage(
    baseCollection: ICollection,
    languageCode: string,
    useFullContextName: boolean = false
): ICollection {
    const languages = CachedTables.languagesByBookCount;
    const languageNames = getDisplayNamesFromLanguageCode(
        languageCode,
        languages
    );

    const localizedCollectionName = getLocalizedCollectionLabel(baseCollection);
    let label = languageNames?.combined || "";
    if (label && useFullContextName)
        label = `${localizedCollectionName} - ${languageNames?.combined}`;

    const baseCollectionFilter =
        baseCollection.filter ??
        getFilterForCollectionAndChildren(baseCollection);
    return {
        ...baseCollection,
        iconForCardAndDefaultBanner: undefined,
        filter: { ...baseCollectionFilter, language: languageCode },
        label,
        title: label,
        urlKey: baseCollection.urlKey + "/:language:" + languageCode,
        layout: "all-books",
    };
}
