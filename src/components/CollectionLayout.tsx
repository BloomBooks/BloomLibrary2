import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { useIntl } from "react-intl";
import { ByTopicsGroups } from "./ByTopicsGroups";
import { ByLevelGroups } from "./ByLevelGroups";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { BookCardGroup } from "./BookCardGroup";
import { ByLanguageCards } from "./ByLanguageCards";

// Different ways we can lay out a collection of books on the page.
// Examples: by topic, by level, by language
// See diagram: https://www.figma.com/file/YfoGLPQkGC1chF6rmuyxdokL/BloomLibrary.org?type=design&node-id=4329%3A10&mode=design&t=4dgnP76Uiwhpdhqk-1

export const CollectionLayout: React.FunctionComponent<{
    collection: ICollection;
    setBooksAndLanguagesCallback?: (value: string) => void;
    hideHeaderAndCount?: boolean;
}> = (props) => {
    const l10n = useIntl();

    function booksAndLanguagesCallback(
        bookCount: number,
        languageCount: number
    ) {
        if (props.setBooksAndLanguagesCallback) {
            props.setBooksAndLanguagesCallback(
                l10n.formatMessage(
                    {
                        id: "bookCount.inLanguages",
                        defaultMessage:
                            "{bookCount} books in {languageCount} languages",
                    },
                    {
                        bookCount,
                        languageCount,
                    }
                )
            );
        }
    }

    let booksComponent: React.ReactElement | null = null;
    if (props.collection.filter) {
        // "layout" is a choice that we can set in Contentful
        switch (props.collection.layout) {
            // Show rows of books, grouped by topic
            default:
            case "by-topic": // still true??: untested on this path, though ByTopicsGroup is used in AllResultsPage
                booksComponent = (
                    <ByTopicsGroups collection={props.collection} />
                );
                break;
            case "no-books": // leave it null
                break;
            case "all-books": // used by at least RISE-PNG
                booksComponent = (
                    <BookCardGroup
                        collection={props.collection}
                        rows={
                            props.collection.rows ? props.collection.rows : 1000
                        } // all-books = all books
                        hideHeaderAndCount={props.hideHeaderAndCount}
                    />
                );
                break;
            // Show rows of books, grouped by level
            case "by-level":
                booksComponent = (
                    <ByLevelGroups collection={props.collection} />
                );
                break;
            // Show rows of books, grouped by language
            case "by-language":
                booksComponent = (
                    <ByLanguageGroups
                        titlePrefix=""
                        collection={props.collection}
                        reportBooksAndLanguages={booksAndLanguagesCallback}
                    />
                );
                break;
            // Show a card for each language in the collection.
            // Each language card will navigate to a virtual subcollection filtered by language.
            case "by-language-cards":
            case "by-language-cards/by-topic":
            case "by-language-cards/by-level":
                booksComponent = (
                    <ByLanguageCards
                        collection={props.collection}
                        reportBooksAndLanguages={booksAndLanguagesCallback}
                    />
                );
                break;
        }
    }

    return booksComponent;
};
