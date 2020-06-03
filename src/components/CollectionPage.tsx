import React from "react";

import { ContentfulBanner } from "./banners/ContentfulBanner";
import { useGetCollectionFromContentful } from "../model/Collections";
import { RowOfCollectionCardsForKey } from "./RowOfCollectionCards";
import { ByLevelGroups } from "./ByLevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";

import { BookCardGroup } from "./BookCardGroup";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { ByTopicsGroups } from "./ByTopicsGroups";

export const CollectionPage: React.FunctionComponent<{
    collectionName: string;
    embeddedMode?: boolean;
}> = (props) => {
    const { collection, error, loading } = useGetCollectionFromContentful(
        props.collectionName
    );
    if (loading) {
        return null;
    }

    if (error) {
        console.error(error);
        return null;
    }

    if (!collection) {
        return <div>Collection not found</div>;
    }

    const collectionRows = collection.childCollections.map((c) => {
        if (c.urlKey === "language-chooser") {
            return <LanguageGroup key="lang" />;
        }
        return <RowOfCollectionCardsForKey key={c.urlKey} urlKey={c.urlKey} />;
    });

    let booksComponent: React.ReactElement | null = null;
    if (collection.filter) {
        // "layout" is a choice that we can set in Contentful
        switch (collection.layout) {
            default:
                //"by-level": I'd like to have this case here for clarity, but lint chokes
                booksComponent = <ByLevelGroups collection={collection} />;
                break;
            case "no-books": // leave it null
                break;
            case "all-books": // untested
                booksComponent = (
                    <BookCardGroup
                        collection={collection}
                        rows={
                            collection.urlKey === "new-arrivals"
                                ? 10
                                : undefined
                        }
                    />
                );
                break;
            case "by-language":
                // enhance: may want to use reportBooksAndLanguages callback so we can insert
                // a string like "X books in Y languages" into our banner. But as yet the
                // ContentfulBanner has no way to do that.
                booksComponent = (
                    <ByLanguageGroups
                        titlePrefix=""
                        filter={collection.filter}
                    />
                );
                break;
            case "by-topic": // untested on this path, though ByTopicsGroup is used in AllResultsPage
                booksComponent = <ByTopicsGroups collection={collection} />;

                break;
        }
    }

    const banner = (
        <ContentfulBanner
            id={collection.banner}
            collection={collection}
            filter={collection.filter}
        />
    );

    return (
        <div>
            {props.embeddedMode || banner}
            <ListOfBookGroups>
                {collectionRows}
                {booksComponent}
            </ListOfBookGroups>
        </div>
    );
};
