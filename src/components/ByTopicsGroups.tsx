import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { BookCardGroup } from "./BookCardGroup";
import { useInternationalizedTopics } from "../model/useInternationalizedTopics";

// For each topic, show a row of books for that topic.
// Note: very similar to ByLevelsGroup, possibly we can factor out something common.
export const ByTopicsGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const contextLangIso = props.collection.urlKey.startsWith("language:")
        ? props.collection.urlKey.substring("language:".length)
        : undefined;
    const topicDict = useInternationalizedTopics();

    const otherValue = topicDict.find((pair) => pair.keyTopic === "Other");

    return (
        <React.Fragment>
            {topicDict.map((topicPair) => (
                <BookCardGroup
                    key={topicPair.keyTopic}
                    collection={makeCollectionForTopic(
                        props.collection,
                        topicPair.keyTopic,
                        topicPair.intlTopic
                    )}
                    contextLangIso={contextLangIso}
                />
            ))}

            {/* Show books that don't have a topic? We don't have a good way to query for that yet;
            need to add special case for "empty" to already complex logic in LibraryQueryHooks
            constructParseBookQuery() */}
            <BookCardGroup
                rows={99}
                collection={makeCollectionForTopic(
                    props.collection,
                    "empty",
                    !!otherValue ? otherValue.intlTopic : "Other"
                )}
                contextLangIso={contextLangIso}
            />
        </React.Fragment>
    );
};

export function makeCollectionForTopic(
    baseCollection: ICollection,
    topic: string,
    intlzdTopic?: string
): ICollection {
    const filter = { ...baseCollection.filter, topic };
    const localizedTopic =
        topic === "empty" && !intlzdTopic
            ? "Other"
            : !!intlzdTopic
            ? intlzdTopic
            : topic;
    const label = baseCollection.label + ` - ${localizedTopic}`;
    const urlKey = baseCollection.urlKey + "/:topic:" + topic;
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
