import React from "react";
import { IntlShape, useIntl } from "react-intl";
import { getBestLevelStringOrEmpty } from "../connection/LibraryQueryHooks";
import { getContextLangTagFromLanguageSegment } from "./Routes";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { ICollection } from "../model/ContentInterfaces";
import { BookCardGroup } from "./BookCardGroup";
import { DuplicateBookFilter } from "../model/DuplicateBookFilter";

// For each level (whether set by a human or just computed), show a row of books for that level.
export const ByLevelGroups: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const l10n = useIntl();
    const contextLangTag = getContextLangTagFromLanguageSegment(
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
                    collection={makeVirtualCollectionOfBooksInCollectionThatHaveLevel(
                        props.collection,
                        level,
                        l10n,
                        contextLangTag
                    )}
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
                collection={makeVirtualCollectionOfBooksInCollectionThatHaveLevel(
                    props.collection,
                    "empty",
                    l10n,
                    contextLangTag
                )}
            />
        </React.Fragment>
    );
};

export function makeVirtualCollectionOfBooksInCollectionThatHaveLevel(
    baseCollection: ICollection,
    level: string,
    l10n: IntlShape,
    contextLangTag?: string
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
        contextLangTag: contextLangTag || baseCollection.contextLangTag,
        duplicateBookFilterName:
            DuplicateBookFilter.PreferBooksWhereL1MatchesContextLanguage,
    };
    if (level !== "empty") {
        result.secondaryFilter = (bookInfo) =>
            getBestLevelStringOrEmpty(bookInfo) === level;
    }
    return result;
}
