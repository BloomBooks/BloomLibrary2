import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { useIntl } from "react-intl";
import { ByTopicsGroups } from "./ByTopicsGroups";
import { ByLevelGroups } from "./ByLevelGroups";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { BookCardGroup } from "./BookCardGroup";

export const CollectionLayout: React.FunctionComponent<{
    collection: ICollection;
    setBooksAndLanguagesCallback?: (value: string) => void;
}> = (props) => {
    const l10n = useIntl();

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
                    />
                );
                break;
            case "by-level":
                booksComponent = (
                    <ByLevelGroups collection={props.collection} />
                );
                break;
            case "by-language":
                // enhance: may want to use reportBooksAndLanguages callback so we can insert
                // a string like "X books in Y languages" into our banner. But as yet the
                // ContentfulBanner has no way to do that.
                booksComponent = (
                    <ByLanguageGroups
                        titlePrefix=""
                        filter={props.collection.filter}
                        reportBooksAndLanguages={(books, languages) => {
                            if (props.setBooksAndLanguagesCallback) {
                                props.setBooksAndLanguagesCallback(
                                    l10n.formatMessage(
                                        {
                                            id: "bookCount.inLanguages",
                                            defaultMessage:
                                                "{bookCount} books in {languageCount} languages",
                                        },
                                        {
                                            bookCount: books,
                                            languageCount: languages,
                                        }
                                    )
                                );
                            }
                        }}
                    />
                );
                break;
        }
    }

    return booksComponent;
};
