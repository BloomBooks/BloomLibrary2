import { css } from "@emotion/react";

import React, { useMemo } from "react";
import { IDateRange, getPublishableDateRangeString } from "./DateRangePicker";
import { useIntl } from "react-intl";
import { ICollection } from "../../model/ContentInterfaces";
import { getLocalizedCollectionLabel } from "../../localization/CollectionLabel";

function useLocalize(prefix: string): (id: string, msg: string) => string {
    const l10n = useIntl();
    const t = useMemo(
        () => (id: string, msg: string) => {
            //console.log(`"${prefix + id}":"${msg}"`);
            return l10n.formatMessage({
                id: prefix + id,
                defaultMessage: msg,
            });
        },
        [l10n, prefix]
    );
    return t;
}

// Explain how we filtered the data
export const QueryDescription: React.FunctionComponent<{
    collection: ICollection;
    dateRange: IDateRange;
}> = (props) => {
    const l10n = useIntl();
    const T = useLocalize("stats.queryDescription.");
    const localizedAny = l10n.formatMessage({
        id: "any",
        defaultMessage: "any",
        description:
            "Used to specify a filter which is unused. For example, country: any or branding: any.",
    });
    return (
        <div>
            <h4
                css={css`
                    margin-bottom: 0;
                `}
            >
                {T("about", "About this data")}
            </h4>
            {T(
                "intro",
                "These statistics are from events we received which fit the following criteria:"
            )}
            <ul
                css={css`
                    margin-top: 0;
                    li {
                        margin-left: 10px;
                    }
                `}
            >
                <li>
                    {T("collection", "Books currently in the collection:")}{" "}
                    {props.collection?.statisticsQuerySpec
                        ? "--" // instead of N/A so that doesn't have to be translated
                        : getLocalizedCollectionLabel(props.collection)}
                </li>
                {/* <li>
                    {T("branding", "Books with branding:")}{" "}
                    {props.collection?.statisticsQuerySpec?.branding ??
                        localizedAny}
                </li> */}
                <li>
                    {T("country", "From users inside of country:")}{" "}
                    {props.collection?.statisticsQuerySpec?.country ??
                        localizedAny}
                </li>
                <li>
                    {T("dateRange", "Date range:")}{" "}
                    {getPublishableDateRangeString(
                        props.dateRange,
                        false,
                        l10n
                    )}
                </li>
            </ul>
            <p>
                {T(
                    "underCountingNote",
                    "Note that the events that devices and browsers try to send to us are sometimes stopped by various network firewalls. Therefore we may be undercounting."
                )}
            </p>
            <p>
                {T(
                    "roundingNote",
                    "Large numbers that have been compacted with a 'k' or 'm' may be rounded up or down. Hover over the number to see the exact value."
                )}
            </p>
        </div>
    );
};
