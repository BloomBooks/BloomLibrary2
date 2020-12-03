import React from "react";
import { useIntl } from "react-intl";
import { kNameToL10NKey } from "../model/CloseVocabularies";
import { ICollection } from "../model/ContentInterfaces";

export function useGetLocalizedCollectionLabel(collection: ICollection) {
    const l10n = useIntl();
    const k = kNameToL10NKey[collection.urlKey];
    const id = k ? k : "collection." + collection.urlKey;
    return l10n.formatMessage({
        id,
        defaultMessage: collection.label,
    });
}

export const CollectionLabel: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const label = useGetLocalizedCollectionLabel(props.collection);
    return <React.Fragment>{label}</React.Fragment>;
};
