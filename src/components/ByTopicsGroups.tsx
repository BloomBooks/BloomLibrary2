import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { BookCardGroup } from "./BookCardGroup";
import { kTopicList } from "../model/ClosedVocabularies";

// For each topic, show a row of books for that topic.
// Note: very similar to ByLevelsGroup, possibly we can factor out something common.
export const ByTopicsGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const contextLangIso = props.collection.urlKey.startsWith("language:")
        ? props.collection.urlKey.substring("language:".length)
        : undefined;
    return (
        <React.Fragment>
            {kTopicList.map((topic) => (
                <BookCardGroup
                    key={topic}
                    collection={makeCollectionForTopic(props.collection, topic)}
                    contextLangIso={contextLangIso}
                />
            ))}

            {/* Show books that don't have a topic? We don't have a good way to query for that yet;
            need to add special case for "empty" to already complex logic in LibraryQueryHooks
            constructParseBookQuery() */}
            <BookCardGroup
                rows={99}
                collection={makeCollectionForTopic(props.collection, "empty")}
                contextLangIso={contextLangIso}
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
    const urlKey = baseCollection.urlKey + "/:topic:" + topic;
    if (topic === "empty") {
        label = baseCollection.label + " - Other";
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
