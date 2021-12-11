import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { useIntl } from "react-intl";
import { ByTopicsGroups } from "./ByTopicsGroups";
import { ByLevelGroups } from "./ByLevelGroups";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { BookCardGroup } from "./BookCardGroup";

export const CollectionLayout: React.FunctionComponent<{
    collection: ICollection;

    // ENHANCE:
    // Originally, this layout-to-component logic only lived in CollectionPage,
    // and we had decided that if a collection didn't have a layout defined, we would
    // just default to using ByTopicsGroups. Then we extracted the logic, creating this
    // component, so it could be used when laying out subcollections on a page (in BookCardGroup).
    // In that case, the default should just be the list of books the way BookCardGroup was
    // doing it previously. In theory, we could move that simple list-of-books layout
    // here as an additional layout option and get rid of this hacky override logic.
    // But we are also considering totally revamping how layouts are defined in various contexts,
    // so it isn't worth the refactoring at the moment.
    defaultLayoutOverride?: JSX.Element;

    setBooksAndLanguagesCallback?: (value: string) => void;
}> = (props) => {
    const l10n = useIntl();

    let booksComponent: React.ReactElement | null = null;
    if (props.collection.filter) {
        if (props.defaultLayoutOverride && !props.collection.rawLayout)
            return props.defaultLayoutOverride;

        // "layout" is a choice that we can set in Contentful
        switch (props.collection.layout) {
            default:
                <ByTopicsGroups collection={props.collection} />;
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
            case "by-topic": // untested on this path, though ByTopicsGroup is used in AllResultsPage
                booksComponent = (
                    <ByTopicsGroups collection={props.collection} />
                );

                break;
        }
    }

    return booksComponent;
};
