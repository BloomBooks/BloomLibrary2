import React from "react";
import { ICollection, topics } from "../model/Collections";
import { BookCardGroup } from "./BookCardGroup";

// For each topic, show a row of books for that topic.
// Note: very similar to ByLevelsGroup, possibly we can factor out something common.
export const ByTopicsGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    return (
        <React.Fragment>
            {topics.map((topic) => (
                <BookCardGroup
                    collection={makeCollectionForTopic(props.collection, topic)}
                />
            ))}

            {/* Show books that don't have a topic? We don't have a good way to query for that yet;
            need to add special case for "empty" to already complex logic in LibraryQueryHooks
            constructParseBookQuery() */}
            <BookCardGroup
                rows={99}
                collection={makeCollectionForTopic(props.collection, "empty")}
            />
        </React.Fragment>
    );
};

export function makeCollectionForTopic(
    baseCollection: ICollection,
    topic: string
): ICollection {
    const filter = { ...baseCollection.filter, topic: topic };
    let label = baseCollection.label + " - " + topic;
    const urlKey = baseCollection.urlKey + "/topic:" + topic;
    if (topic === "empty") {
        label = baseCollection.label + " - (missing a topic)";
    }
    // Enhance: how can we append "- topic" to title, given that it's some unknown
    // contentful representation of a rich text?
    const result = {
        ...baseCollection,
        filter,
        label,
        title: label,
        urlKey,
    };
    return result;
}

// Todo: something needs to handle /topic:X in a /more/ url
// need to get layout into collection
