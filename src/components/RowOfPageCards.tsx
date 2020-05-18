import React, { useContext } from "react";
import {
    ICollection2,
    getCollectionData,
    useCollection,
} from "../model/Collections";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";
import { CollectionGroup } from "./CollectionGroup";

export const RowOfPageCardsForKey: React.FunctionComponent<{
    urlKey: string;
    parents?: string;
}> = (props) => {
    const { collection, error, loading } = useCollection(props.urlKey);
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

    if (error) {
        console.error(error);
        return null;
    }

    if (collection.childCollections.length > 0) {
        return (
            <RowOfPageCards collection={collection} parents={props.parents} />
        );
    } else {
        return (
            <CollectionGroup collection={collection} parents={props.parents} />
        );
    }
};

export const RowOfPageCards: React.FunctionComponent<{
    collection: ICollection2;
    parents?: string;
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
            <CategoryCard
                key={key}
                title={childCollection.label || ""}
                bookCount="??"
                filter={childCollection.filter}
                href={(props.parents ? props.parents + "~" : "") + key}
                //pageType={props.bookShelfCategory}
                img={childCollection.icon}
            />
        );
    });
    return (
        <CategoryCardGroup title={props.collection.label}>
            {cards}
        </CategoryCardGroup>
    );
};
