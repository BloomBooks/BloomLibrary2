import React, { useContext } from "react";
import { ICollection2, getCollectionData } from "../model/Collections";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";
import { useContentful } from "react-contentful";

export const RowOfPageCardsForKey: React.FunctionComponent<{
    urlKey: string;
    parents?: string;
}> = (props) => {
    const { data, error, fetched, loading } = useContentful({
        contentType: "collection",
        query: {
            "fields.key": `${props.urlKey}`,
        },
    });
    if (loading || !fetched) {
        return null;
    }

    if (error) {
        console.error(error);
        return null;
    }

    console.log(JSON.stringify(data));
    if (!data || (data as any).items.length === 0) {
        return <p>Page does not exist.</p>;
    }

    //const collection = collections.get(collectionName);
    const collection: ICollection2 = getCollectionData(
        (data as any).items[0].fields
    );
    return <RowOfPageCards collection={collection} parents={props.parents} />;
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
