import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { LevelGroups } from "./LevelGroups";
import { ExternalLink } from "./banners/ExternalLink";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { collections, ICollection } from "../model/Collections";

export const ByLevelPage: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const filter = props.collection.filter;
    let description = props.collection.blurbHardCoded;
    if (!description) {
        // Todo: figure out how to make one out of blurbContentfulJson or something similar
        description = <div>No more details available</div>;
    }
    return (
        <div>
            <PublisherBanner
                title={props.collection.title}
                showTitle={!props.collection.hideTitle}
                filter={filter}
                logoUrl={props.collection.logoUrl}
                collectionDescription={description}
            />

            <ListOfBookGroups>
                <LevelGroups collection={props.collection} />
            </ListOfBookGroups>
        </div>
    );
};
