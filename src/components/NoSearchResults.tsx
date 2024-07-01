import React from "react";
import { useTrack } from "../analytics/Analytics";
import { useIntl, FormattedMessage } from "react-intl";

// This is displayed when the user types a search and there are no matches.
// It also reports this event to analytics.
export const NoSearchResults: React.FunctionComponent<{ match: string }> = (
    props
) => {
    useTrack("Search Failed", { match: props.match }, true);
    const l10n = useIntl();
    const buttonLabel = l10n.formatMessage({
        id: "header.searchDeeper",
        defaultMessage: "Search Deeper",
    });
    const message =
        "We didn't find an exact match in a title for {searchTerms}. Click {buttonLabel} to search in other fields and with looser matching.";
    return (
        <div>
            <FormattedMessage
                id="search.noSearchResults"
                defaultMessage={message}
                values={{
                    searchTerms: <strong>{props.match}</strong>,
                    buttonLabel: <em>{buttonLabel}</em>,
                }}
            />
        </div>
    );
};
