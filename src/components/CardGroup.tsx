// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import { useGetCollection } from "../model/Collections";
import { CardRow } from "./CardRow";
import { BookCardGroup } from "./BookCardGroup";
import { PageNotFound } from "./PageNotFound";
import { ICollection } from "../model/ContentInterfaces";
import { useStoryCardSpec } from "./StoryCard";
import { CollectionCardLayout, useCollectionCardSpec } from "./CollectionCard";
import { useResponsiveChoice } from "../responsiveUtilities";
import { CollectionLabel } from "../localization/CollectionLabel";

export interface ICardSpec {
    cardWidthPx: number;
    cardHeightPx: number;
    // Currently, this corresponds to horizontal *and* vertical spacing between cards.
    // JH said he wants them the same for now, but we may need to create separate variables eventually.
    cardSpacingPx: number;
    // not used by language card & other things that are not collection-based
    createFromCollection?: (collection: ICollection) => any;
}

export function useBaseCardSpec(): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    return {
        cardSpacingPx: getResponsiveChoice(10, 20) as number,

        // These are not currently used.
        // Until they are, keep them simple and fast (not responsive).
        cardWidthPx: 100,
        cardHeightPx: 100,
    };
}

// These can be a group of book cards, collection cards, story page cards, or generic page cards
export const CardGroup: React.FunctionComponent<{
    urlKey: string;
    rows?: number;
    useCollectionLayoutSettingForBookCards?: boolean;
}> = (props) => {
    const { collection, loading } = useGetCollection(props.urlKey);
    if (loading) {
        return null;
    }

    if (!collection) {
        return <PageNotFound />;
    }

    if (collection.childCollections.length > 0) {
        return <GroupOfCollectionCards collection={collection} />;
    } else {
        return (
            <BookCardGroup
                collection={collection}
                rows={props.rows}
                useCollectionLayoutSettingForBookCards={
                    props.useCollectionLayoutSettingForBookCards
                }
            />
        );
    }
};

const GroupOfCollectionCards: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const getResponsiveChoice = useResponsiveChoice();
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

    // So `expandChildCollectionRows` is an unfortunate name. It just means wrap when you run out of space, instead of introducing a slider.
    if (props.collection.expandChildCollectionRows) {
        return (
            <React.Fragment>
                <h1
                    css={css`
                        font-size: ${getResponsiveChoice(10, 14)}pt;
                    `}
                >
                    <CollectionLabel
                        collection={props.collection}
                    ></CollectionLabel>
                </h1>
                <ul
                    css={css`
                        display: flex;
                        flex-wrap: wrap;
                        padding-inline-start: 0;
                    `}
                >
                    {props.collection.childCollections.map((childCollection) =>
                        cardSpec.createFromCollection!(childCollection)
                    )}
                </ul>
            </React.Fragment>
        );
    } else
        return (
            <CardRow
                collection={props.collection}
                data={props.collection.childCollections}
                cardSpec={cardSpec}
                getCards={(childCollection: ICollection, index) =>
                    cardSpec.createFromCollection!(childCollection)
                }
                layout={props.collection.layout}
            />
        );
};
