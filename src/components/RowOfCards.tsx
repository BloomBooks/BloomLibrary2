// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { useGetCollection } from "../model/Collections";
import { CardGroup } from "./CardGroup";
import { CollectionCard } from "./CollectionCard";
import { BookCardGroup } from "./BookCardGroup";
import { PageNotFound } from "./PageNotFound";
import { ICollection } from "../model/ContentInterfaces";
import { StoryCard } from "./StoryCard";

// These can be a group of book cards, collection cards, story page cards, or generic page cards
export const RowOfCards: React.FunctionComponent<{
    urlKey: string;
}> = (props) => {
    const { collection, loading } = useGetCollection(props.urlKey);
    if (loading) {
        return null;
    }

    if (!collection) {
        return <PageNotFound />;
    }

    if (collection.childCollections.length > 0) {
        return <RowOfCardsInternal collection={collection} />;
    } else {
        return <BookCardGroup collection={collection} />;
    }
};

const RowOfCardsInternal: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    if (
        !props.collection.childCollections ||
        props.collection.childCollections.length === 0
    ) {
        return null;
    }

    // https://issues.bloomlibrary.org/youtrack/issue/BL-9089 likely we do want some kinds of rows
    // sorted, and others not sorted. For now, let's require the librarian to hand-sort the ones
    // she wants sorted
    // const childCollections = props.collection.childCollections.sort((x, y) =>
    //     x.label.localeCompare(y.label)
    // );
    const childCollections = props.collection.childCollections;
    console.log(`${props.collection.label} ${props.collection.layout}`);
    return (
        <CardGroup
            collection={props.collection}
            data={childCollections}
            getCards={(childCollection: ICollection, index) => {
                switch (props.collection.layout) {
                    case "row-of-story-cards":
                        return (
                            <StoryCard
                                story={childCollection}
                                key={childCollection.urlKey}
                            />
                        );
                    case "row-of-cards-with-just-labels":
                        return (
                            <CollectionCard
                                collection={childCollection}
                                key={childCollection.urlKey}
                                layout={"short"}
                            />
                        );
                    // Row of different topic cards will use this
                    case "row-of-cards-with-just-labels-and-book-count":
                        return (
                            <CollectionCard
                                collection={childCollection}
                                key={childCollection.urlKey}
                                layout={"short-with-book-count"}
                            />
                        );
                    default:
                        return (
                            <CollectionCard
                                collection={childCollection}
                                key={childCollection.urlKey}
                            />
                        );
                }
            }}
            layout={props.collection.layout}
        />
    );
};
