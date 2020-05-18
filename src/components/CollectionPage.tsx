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
    //const { collections } = useContext(CachedTablesContext);
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    const collectionNames = props.collectionNames.split("~");
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

    let collectionIso: string | undefined; // iso code if collection is a generated language collection

    let collection: ICollection2;
    console.log(JSON.stringify(data));
    if (!data || (data as any).items.length === 0) {
        if (collectionName.startsWith("language:")) {
            collectionIso = collectionName.substring("language:".length);
            collection = makeLanguageCollection(collectionIso, languages);
        } else {
            return <p>Page does not exist.</p>;
        }
    } else {
        // usual case, got collection from contentful
        //const collection = collections.get(collectionName);
        collection = getCollectionData((data as any).items[0].fields);
        console.log(JSON.stringify(collection));
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
            {collectionIso ? (
                // Currently we use a special header for generated language collections.
                // We should probaby generalize somehow if we get a second kind of generated collection.
                <CustomizableBanner
                    filter={collection.filter}
                    title={collection.label}
                    spec={getLanguageBannerSpec(collectionIso)}
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
