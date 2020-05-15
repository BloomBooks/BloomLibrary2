import React, { useEffect, useState, useMemo, useContext } from "react";
import { ByLevelPage } from "./PublisherPages";
import { EnablingWritersPage } from "./EnablingWritersPage";
//import { CachedTablesContext } from "../App";
import { useContentful } from "react-contentful";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import {
    ICollection2,
    ISubCollection,
    getCollectionData,
} from "../model/Collections";
import { RowOfPageCards, RowOfPageCardsForKey } from "./RowOfPageCards";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { LevelGroups } from "./LevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";

// export interface IBanner {
//     name: string;
//     bannerImage: string; // contentful id
//     imageCredits: any; // contentful rich text
//     blurb: any; // contentful rich text
// }

export const CollectionPage: React.FunctionComponent<{
    collectionNames: string;
}> = (props) => {
    //const { collections } = useContext(CachedTablesContext);
    const collectionNames = props.collectionNames.split("|");
    const collectionName = collectionNames[collectionNames.length - 1];
    const { data, error, fetched, loading } = useContentful({
        contentType: "collection",
        query: {
            "fields.key": `${collectionName}`,
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
    console.log(JSON.stringify(collection));

    let collectionRows = collection.childCollections.map((c) => (
        <RowOfPageCardsForKey key={c.urlKey} urlKey={c.urlKey} />
    ));

    let booksComponent: React.ReactElement | null = null;
    switch (collection.layout) {
        default:
            //"by-level": I'd like to have this case here for clarity, but link chokes
            booksComponent = <LevelGroups collection={collection} />;
            break;
    }

    return (
        <div>
            <ContentfulBanner id={collection.banner} />
            <ListOfBookGroups>
                {collectionRows}
                {booksComponent}
            </ListOfBookGroups>
        </div>
    );
};
