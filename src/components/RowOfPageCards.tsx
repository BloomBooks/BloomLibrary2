import React from "react";
import {
    ICollection,
    useGetCollectionFromContentful,
} from "../model/Collections";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";
import { CollectionGroup } from "./CollectionGroup";

export const RowOfPageCardsForKey: React.FunctionComponent<{
    urlKey: string;
    breadcrumbs: string[];
}> = (props) => {
    const { collection, error, loading } = useGetCollectionFromContentful(
        props.urlKey
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

    if (error) {
        console.error(error);
        return null;
    }

    if (collection.childCollections.length > 0) {
        return (
            <RowOfPageCards
                collection={collection}
                breadcrumbs={props.breadcrumbs}
            />
        );
    } else {
        return (
            <CollectionGroup
                collection={collection}
                breadcrumbs={props.breadcrumbs}
            />
        );
    }
};

export const RowOfPageCards: React.FunctionComponent<{
    collection: ICollection;
    breadcrumbs: string[];
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
                richTextLabel={childCollection.richTextLabel}
                hideTitle={childCollection.hideLabelOnCardAndDefaultBanner}
                bookCount="??"
                filter={childCollection.filter}
                href={"/" + [...props.breadcrumbs, key].join("~")}
                //pageType={props.bookShelfCategory}
                img={childCollection.iconForCardAndDefaultBanner}
                credits={childCollection.iconCredits}
                altText={childCollection.iconAltText}
            />
        );
    });
    return (
        <CategoryCardGroup title={props.collection.label}>
            {cards}
        </CategoryCardGroup>
    );
};
