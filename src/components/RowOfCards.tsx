import React from "react";
import { useGetCollection } from "../model/Collections";
import { CardGroup } from "./CardGroup";
import { CollectionCard, collectionCardWidth } from "./CollectionCard";
import { BookCardGroup } from "./BookCardGroup";
import { PageNotFound } from "./PageNotFound";
import { ICollection } from "../model/ContentInterfaces";
import { StoryCard, storyCardWidth } from "./StoryCard";

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

    return (
        <CardGroup
            collection={props.collection}
            data={childCollections}
            placeHolderWidth={
                props.collection.layout === "row-of-story-cards"
                    ? storyCardWidth
                    : collectionCardWidth
            }
            contentMaker={(childCollection, index) => {
                switch (props.collection.layout) {
                    case "row-of-story-cards":
                        return (
                            <StoryCard
                                story={childCollection}
                                key={childCollection!.urlKey}
                            />
                        );
                    default:
                        return (
                            <CollectionCard
                                collection={childCollection}
                                kind={
                                    props.collection.layout ===
                                    "row-of-cards-with-just-labels"
                                        ? "short"
                                        : undefined
                                }
                                key={childCollection!.urlKey}
                            />
                        );
                }
            }}
            layout={props.collection.layout}
        />
    );
};
