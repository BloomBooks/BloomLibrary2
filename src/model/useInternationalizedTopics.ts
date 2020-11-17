import { useIntl } from "react-intl";
import { kTopicList } from "./ClosedVocabularies";

export function useInternationalizedTopics() {
    const topicDict: Array<{ keyTopic: string; intlTopic: string }> = [];
    const l10n = useIntl();

    kTopicList.forEach((keyTopic) => {
        topicDict.push({
            keyTopic,
            intlTopic: l10n.formatMessage({
                id: `topic.${keyTopic}`,
                defaultMessage: keyTopic,
            }),
        });
    });
    // Add "Other", if present
    const other = l10n.formatMessage({
        id: `topic.Other`,
        defaultMessage: "Other",
    });
    if (other) {
        topicDict.push({ keyTopic: "Other", intlTopic: other });
    }

    return topicDict;
}
