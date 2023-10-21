import React from "react";
import { ICollection } from "../model/ContentInterfaces";
import { BookCardGroup } from "./BookCardGroup";
import { getContextLangIsoFromLanguageSegment } from "./Routes";
import { kTopicList } from "../model/ClosedVocabularies";
import { getTranslation } from "../localization/GetLocalizations";
import { kNameOfNoTopicCollection } from "../connection/LibraryQueryHooks";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";

// For each topic, show a row of books for that topic.
// Note: very similar to ByLevelsGroup, possibly we can factor out something common.
export const ByTopicsGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const contextLangIso = getContextLangIsoFromLanguageSegment(
        props.collection.urlKey
    );

    // const otherTopic = TopicsList.find(
    //     (topic: ITopic) => topic.key === "Other"
    // ) as ITopic;
    return (
        <React.Fragment>
            {kTopicList.map((topic) => (
                <BookCardGroup
                    key={topic}
                    collection={makeVirtualCollectionOfBooksInCollectionThatHaveTopic(
                        props.collection,
                        topic,
                        contextLangIso
                    )}
                />
            ))}

            {/* Show books that don't have a topic */}
            <BookCardGroup
                rows={99}
                collection={makeVirtualCollectionOfBooksInCollectionThatHaveTopic(
                    props.collection,
                    kNameOfNoTopicCollection,
                    contextLangIso
                )}
            />
        </React.Fragment>
    );
};

export function makeVirtualCollectionOfBooksInCollectionThatHaveTopic(
    baseCollection: ICollection,
    topic: string,
    contextLangIso?: string
): ICollection {
    const filter = { ...baseCollection.filter, topic };
    const label = `${getLocalizedCollectionLabel(
        baseCollection
    )} - ${getTranslation("topic." + topic, topic)}`;
    const urlKey = baseCollection.urlKey + "/:topic:" + topic;
    // Enhance: how can we append "- topic" to title, given that it's some unknown
    // contentful representation of a rich text?
    const result = {
        ...baseCollection,
        filter,
        label,
        title: label,
        urlKey,
        contextLangIso,
    };
    return result;
}

// Todo: something needs to handle /topic:X in a /more/ url
// need to get layout into collection
