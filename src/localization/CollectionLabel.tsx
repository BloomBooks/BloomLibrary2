// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { useIntl } from "react-intl";
import { kNameToL10NKey } from "../model/CloseVocabularies";
import { ICollection } from "../model/ContentInterfaces";

export function useGetLocalizedCollectionLabel(collection: ICollection) {
    const l10n = useIntl();
    const k = kNameToL10NKey[collection.urlKey];
    const id = k ? k : "collection." + collection.urlKey;
    console.log(`xxxx id:${id}  k:${k}`);
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
