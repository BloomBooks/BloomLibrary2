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
            case "by-level":
                booksComponent = (
                    <ByLevelGroups collection={props.collection} />
                );
                break;
            case "by-language":
                booksComponent = (
                    <ByLanguageGroups
                        titlePrefix=""
                        collection={props.collection}
                        reportBooksAndLanguages={booksAndLanguagesCallback}
                    />
                );
                break;
            case "by-language-cards":
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
