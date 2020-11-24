import { useIntl } from "react-intl";

const kTopicKeys = [
    "Agriculture",
    "Animal Stories",
    "Business",
    "Dictionary",
    "Environment",
    "Primer",
    "Math",
    "Culture",
    "Science",
    "Story Book",
    "Traditional Story",
    "Health",
    "Personal Development",
    "Spiritual",
];

export interface ITopic {
    key: string;
    displayName: string;
}

export function useInternationalizedTopics() {
    const topicDict: ITopic[] = [];
    const l10n = useIntl();

    kTopicKeys.forEach((topic) => {
        topicDict.push({
            key: topic,
            displayName: l10n.formatMessage({
                id: `topic.${topic}`,
                defaultMessage: topic,
            }),
        });
    });
    // Add "Other". The l10n call will always at least return the English.
    const other = l10n.formatMessage({
        id: `topic.Other`,
        defaultMessage: "Other",
    });
    topicDict.push({ key: "Other", displayName: other });

    return topicDict;
}
