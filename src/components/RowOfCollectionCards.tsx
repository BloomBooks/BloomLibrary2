import React from "react";
import { useGetCollection } from "../model/Collections";
import { CardGroup } from "./CardGroup";
import { CollectionCard } from "./CollectionCard";
import { BookCardGroup } from "./BookCardGroup";
import { PageNotFound } from "./PageNotFound";
import { ICollection } from "../model/ContentInterfaces";

export const RowOfCollectionCardsForKey: React.FunctionComponent<{
    urlKey: string;
}> = (props) => {
    const { collection, error, loading } = useGetCollection(props.urlKey);
    if (loading) {
        return null;
    }

    if (error) {
        console.error(error);
        return null;
    }

    if (!collection) {
        return <PageNotFound />;
    }

    if (error) {
        console.error(error);
        return null;
    }

    if (collection.childCollections.length > 0) {
        return <RowOfCollectionCards collection={collection} />;
    } else {
        return <BookCardGroup collection={collection} />;
    }
};

export const RowOfCollectionCards: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    if (
        !props.collection.childCollections ||
        props.collection.childCollections.length === 0
    ) {
        return null;
    }
    const childCollections = props.collection.childCollections.sort((x, y) =>
        x.label.localeCompare(y.label)
    );
    const cards: JSX.Element[] = childCollections.map((childCollection1) => {
        const childCollection = childCollection1!; // can't persuade typescript that this can't be null.
        const key = childCollection!.urlKey;
        return (
            <CollectionCard
                key={key}
                title={childCollection.label || ""}
                richTextLabel={childCollection.richTextLabel}
                hideTitle={childCollection.hideLabelOnCardAndDefaultBanner}
                bookCount="??"
                filter={childCollection.filter}
                target={`/${key}`}
                //pageType={props.bookShelfCategory}
                img={childCollection.iconForCardAndDefaultBanner?.url || ""}
                credits={childCollection.iconCredits}
                altText={childCollection.iconAltText}
            />
        );
    });
    return <CardGroup title={props.collection.label}>{cards}</CardGroup>;
};
