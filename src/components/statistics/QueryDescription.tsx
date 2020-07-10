// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useMemo } from "react";
import { IDateRange, rangeToString } from "./DateRangePicker";
import { useIntl } from "react-intl";
import { ICollection } from "../../model/ContentInterfaces";
function useLocalize(prefix: string): (id: string, msg: string) => string {
    const l10n = useIntl();
    const t = useMemo(
        () => (id: string, msg: string) => {
            console.log(`"${prefix + id}":"${msg}"`);
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
                "These statistic are from events we received which fit the following criteria:"
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
                        : props.collection.label}
                </li>
                <li>
                    {T("branding", "Books with branding:")}{" "}
                    {props.collection?.statisticsQuerySpec?.branding ?? "any"}
                </li>
                <li>
                    {T("country", "From users inside of country:")}{" "}
                    {props.collection?.statisticsQuerySpec?.country ?? "any"}
                </li>
                <li>
                    {T("dateRange", "Date range:")}{" "}
                    {rangeToString(props.dateRange, l10n)}
                </li>
            </ul>
            {T(
                "underCountingNote",
                "Note that the events that devices and browsers try to send to us are sometimes stopped by various network firewalls. Therefore we may be under counting."
            )}
        </div>
    );
};
