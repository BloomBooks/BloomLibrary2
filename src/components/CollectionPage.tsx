import React, { useEffect, useState, useMemo, useContext } from "react";
import { ByLevelPage } from "./PublisherPages";
import { EnablingWritersPage } from "./EnablingWritersPage";
//import { CachedTablesContext } from "../App";
import { useContentful } from "react-contentful";
import { ContentfulBanner } from "./banners/ContentfulBanner";
import { IFilter } from "../IFilter";
import { RowOfPageCards, RowOfPageCardsForKey } from "./RowOfPageCards";

// This is supposed to correspond to the (data as any).fields that we will actually get
// back from a contenful query on "collection"
export interface ICollection2 {
    urlKey: string;
    label: string;
    title: any; // rich text, use how??
    childCollections: ISubCollection[]; //
    banner: string; // contentful ID of banner object. (fields.banner.id)
    icon: string; // url
    filter: IFilter;
    layout: string; // from layout.fields.name
}

export interface ISubCollection {
    urlKey: string; // used in react router urls; can be used to look up in contentful
    label: string; // used in subheadings and cards
    filter: IFilter;
    icon: string; // url
    childCollections: ISubCollection[]; // only the top level will have these
}

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
        <RowOfPageCardsForKey urlKey={c.urlKey} />
    ));

    return (
        <div>
            <ContentfulBanner id={collection.banner} />
            {collectionRows}
        </div>
    );
};

export function getCollectionData(fields: any): ICollection2 {
    const result: ICollection2 = {
        urlKey: fields.key as string,
        label: fields.label,
        title: fields.title,
        filter: fields.filter,
        childCollections: getSubCollections(fields.childCollections),
        banner: fields.banner?.sys?.id,
        icon: fields?.icon?.fields?.file?.url,
        layout: fields.layout?.fields?.name || "by-level",
    };
    return result;
}

function getSubCollections(childCollections: any[]): ISubCollection[] {
    if (!childCollections) {
        return [];
    }
    // The final map here is a kludge to convince typescript that filtering out
    // the undefined elements yields a collections without any undefineds.
    return childCollections
        .map((x: any) => getSubCollectionData(x.fields))
        .filter((y) => y)
        .map((z) => z!);
}

function getSubCollectionData(fields: any): ISubCollection | undefined {
    if (!fields || !fields.key) {
        return undefined;
    }
    const result: ISubCollection = {
        urlKey: fields.key as string,
        label: fields.label,
        filter: fields.filter,
        icon: fields?.icon?.fields?.file?.url,
        childCollections: getSubCollections(fields.childCollections),
    };
    return result;
}
