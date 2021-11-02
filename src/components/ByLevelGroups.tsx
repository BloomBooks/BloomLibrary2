import React from "react";
import { IntlShape, useIntl } from "react-intl";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { getContextLangIsoFromLanguageSegment } from "./Routes";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { ICollection } from "../model/ContentInterfaces";
import { BookCardGroup } from "./BookCardGroup";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const ByLevelGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const l10n = useIntl();
    const contextLangIso = getContextLangIsoFromLanguageSegment(
        props.collection.urlKey
    );
    return (
        <React.Fragment>
            {["1", "2", "3", "4"].map((level) => (
                <BookCardGroup
                    key={level}
                    title={l10n.formatMessage(
                        {
                            id: "book.metadata.level",
                            defaultMessage: "Level {levelNumber}",
                        },
                        { levelNumber: level }
                    )}
                    collection={makeCollectionForLevel(
                        props.collection,
                        level,
                        l10n
                    )}
                    contextLangIso={contextLangIso}
                />
            ))}

            {/* Show books that don't have a level */}
            <BookCardGroup
                key="empty"
                title={l10n.formatMessage({
                    id: "level.none",
                    defaultMessage: "Books that don't have a level",
                    description:
                        "Used to label books which are missing level information.",
                })}
                rows={99}
                collection={makeCollectionForLevel(
                    props.collection,
                    "empty",
                    l10n
                )}
                contextLangIso={contextLangIso}
            />
        </React.Fragment>
    );
};

export function makeCollectionForLevel(
    baseCollection: ICollection,
    level: string,
    l10n: IntlShape
): ICollection {
    let search = "level:" + level;
    if (baseCollection.filter?.search) {
        search += " " + baseCollection.filter.search;
    }
    const filter = { ...baseCollection.filter, search };
    const localizedCollectionName = getLocalizedCollectionLabel(baseCollection);
    let levelLabel = l10n.formatMessage(
        {
            id: "book.metadata.level",
            defaultMessage: "Level {levelNumber}",
        },
        { levelNumber: level }
    );
    const urlKey = baseCollection.urlKey + "/:level:" + level;
    if (level === "empty") {
        levelLabel = l10n.formatMessage(
            {
                id: "level.none.collection",
                defaultMessage: "Missing level",
                description:
                    'Used to label books in a particular collection which are missing level information. For example, "COVID-19 - Missing level" as opposed to "COVID-19 - Level 1".',
            },
            { collectionName: localizedCollectionName }
        );
    }
    const label = `${localizedCollectionName} - ${levelLabel}`;
    // Enhance: how can we append -Level:1 to title, given that it's some unknown
    // contentful representation of a rich text?
    const result = {
        ...baseCollection,
        filter,
        label,
        title: label,
        urlKey,
        layout: "by-topic",
    };
    if (level !== "empty") {
        result.secondaryFilter = (bookInfo) =>
            getBestLevelStringOrEmpty(bookInfo) === level;
    }
    return result;
}
