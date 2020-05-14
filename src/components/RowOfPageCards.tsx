import React, { useContext } from "react";
import { ICollection } from "../model/Collections";
import { CategoryCardGroup } from "./CategoryCardGroup";
import CategoryCard from "./CategoryCard";
import { CachedTablesContext } from "../App";

// Normally the bookshelf name matches the image name, but if not we change it here:
// Todo: this is duplicated from BookshelfGroup. In the unlikely event that survives,
// it should be shared.
// Alternatively, possibly the image name should simply be a field in collection.
// But for now I'm trying to make it give the same results as the old BookshelfGroup.
const nameToImageMap = new Map<string, string>([
    //  // something in our pipeline won't deliver an image that starts with "3"
    ["3Asafeer", "Asafeer"],
    ["Room To Read", "Room to Read"],
    ["Ministerio de Educación de Guatemala", "guatemala-moe-logo.svg"],
    ["Resources for the Blind, Inc. (Philippines)", "Resources for the Blind"],
]);

export const RowOfPageCards: React.FunctionComponent<{
    title: string;
    collection: ICollection;
    parents?: string;
}> = (props) => {
    const { collections } = useContext(CachedTablesContext);
    if (!props.collection.children || props.collection.children.length == 0) {
        return null;
    }
    const childCollections = props.collection.children
        .sort()
        .map((childCollectionName) => collections.get(childCollectionName))
        .filter((x) => x);
    const cards: JSX.Element[] = childCollections.map((childCollection1) => {
        const childCollection = childCollection1!; // can't persuade typescript that this can't be null.
        const key = childCollection!.key ?? childCollection!.title;
        let imageName =
            nameToImageMap.get(childCollection.title) ?? childCollection.title;
        // there is (was?) a convention of naming the shelf image after the shelf, with png
        if (imageName.indexOf(".") < 0) imageName += ".png";
        return (
            <CategoryCard
                key={key}
                preTitle={childCollection.preTitle}
                title={childCollection.title || ""}
                bookCount="??"
                filter={childCollection.filter}
                href={(props.parents ? props.parents + "|" : "") + key}
                //pageType={props.bookShelfCategory}
                img={
                    "https://share.bloomlibrary.org/bookshelf-images/" +
                    imageName
                }
            />
        );
    });
    return <CategoryCardGroup {...props}>{cards}</CategoryCardGroup>;
};
