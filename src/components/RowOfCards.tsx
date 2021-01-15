import React from "react";
import { useGetCollection } from "../model/Collections";
import { CardGroup } from "./CardGroup";
import { BookCardGroup } from "./BookCardGroup";
import { PageNotFound } from "./PageNotFound";
import { ICollection } from "../model/ContentInterfaces";
import { useStoryCardSpec } from "./StoryCard";
import { CollectionCardLayout, useCollectionCardSpec } from "./CollectionCard";

export interface ICardSpec {
    cardWidthPx: number;
    cardHeightPx: number;
    // not used by language card & other things that are not collection-based
    createFromCollection?: (collection: ICollection) => any;
}

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
        return <RowOfCollectionCards collection={collection} />;
    } else {
        return <BookCardGroup collection={collection} />;
    }
};

const RowOfCollectionCards: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const cardSpecs: { [id: string]: ICardSpec } = {};
    cardSpecs["row-of-story-cards"] = useStoryCardSpec();
    cardSpecs["row-of-cards-with-just-labels"] = useCollectionCardSpec(
        CollectionCardLayout.short
    );
    cardSpecs["row-of-icon-cards"] = useCollectionCardSpec(
        CollectionCardLayout.iconAndBookCount
    );
    cardSpecs[
        "row-of-cards-with-just-labels-and-book-count"
    ] = useCollectionCardSpec(CollectionCardLayout.shortWithBookCount);

    /* TODO we're in transition in our model... currently we are conflating the
    card layout and size with how to lay out book cards. And if the former is
    not defined, then we have code that sets the (semantically conflated) layout
    to "by-topic". Until we fix that, show those cards as ones with icons. */
    cardSpecs["by-topic"] = useCollectionCardSpec(
        CollectionCardLayout.iconAndBookCount
    );

    if (
        !props.collection.childCollections ||
        props.collection.childCollections.length === 0
    ) {
        return null;
    }

    console.log(`${props.collection.label}: ${props.collection.layout}`);

    const cardSpec = cardSpecs[props.collection.layout];
    console.assert(
        cardSpec,
        `No cardSpec for layout "${props.collection.layout}".`
    );

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
            cardSpec={cardSpec}
            getCards={(childCollection: ICollection, index) =>
                cardSpec.createFromCollection!(childCollection)
            }
            layout={props.collection.layout}
        />
    );
};
