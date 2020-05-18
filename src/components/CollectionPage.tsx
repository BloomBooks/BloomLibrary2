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
    makeLanguageCollection,
    useCollection,
} from "../model/Collections";
import { RowOfPageCards, RowOfPageCardsForKey } from "./RowOfPageCards";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { LevelGroups } from "./LevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";
import { CachedTablesContext } from "../App";
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { getLanguageBannerSpec } from "./banners/LanguageCustomizations";

// export interface IBanner {
//     name: string;
//     bannerImage: string; // contentful id
//     imageCredits: any; // contentful rich text
//     blurb: any; // contentful rich text
// }

export const CollectionPage: React.FunctionComponent<{
    collectionNames: string;
}> = (props) => {
    const collectionNames = props.collectionNames.split("~");
    const collectionName = collectionNames[collectionNames.length - 1];
    const { collection, error, generatorTag, loading } = useCollection(
        collectionName
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

    const collectionRows = collection.childCollections.map((c) => {
        if (c.urlKey === "language-chooser") {
            return <LanguageGroup />;
        }
        return (
            <RowOfPageCardsForKey
                key={c.urlKey}
                urlKey={c.urlKey}
                parents={collection.urlKey}
            />
        );
    });

    let booksComponent: React.ReactElement | null = null;
    switch (collection.layout) {
        default:
            //"by-level": I'd like to have this case here for clarity, but link chokes
            booksComponent = <LevelGroups collection={collection} />;
            break;
    }

    return (
        <div>
            {generatorTag ? (
                // Currently we use a special header for generated language collections.
                // We should probaby generalize somehow if we get a second kind of generated collection.
                <CustomizableBanner
                    filter={collection.filter}
                    title={collection.label}
                    spec={getLanguageBannerSpec(generatorTag)}
                />
            ) : (
                <ContentfulBanner id={collection.banner} />
            )}
            <ListOfBookGroups>
                {collectionRows}
                {booksComponent}
            </ListOfBookGroups>
        </div>
    );
};
