import React from "react";
import { useIntl } from "react-intl";
import { kNameToL10NKey } from "../model/ClosedVocabularies";
import { ICollection } from "../model/ContentInterfaces";
import { getTranslation } from "./GetLocalizations";

export function useGetLocalizedCollectionLabel(
    collection: ICollection | undefined
) {
    const l10n = useIntl();
    if (!collection) return "";

    return l10n.formatMessage({
        id: getLabelL10nId(collection),
        defaultMessage: collection.label,
    });
}

export function getLocalizedCollectionLabel(collection: ICollection) {
    return getTranslation(getLabelL10nId(collection), collection.label);
}

function getLabelL10nId(collection: ICollection): string {
    const l10nKey = kNameToL10NKey[collection.urlKey];
    if (l10nKey) return l10nKey;

    if (collection.urlKeyToUseForLabelL10n)
        return "collection." + collection.urlKeyToUseForLabelL10n;

    return "collection." + collection.urlKey;
}

export const CollectionLabel: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    let label = useGetLocalizedCollectionLabel(props.collection);
    const l10n = useIntl();
    const isLanguageCollection =
        (props.collection.urlKey ?? "").indexOf("language:") >= 0;
    if (isLanguageCollection) {
        label = l10n.formatMessage(
            { id: "booksTitle", defaultMessage: "{langName} books" },
            { langName: label }
        );
    }
    return <React.Fragment>{label}</React.Fragment>;
};
