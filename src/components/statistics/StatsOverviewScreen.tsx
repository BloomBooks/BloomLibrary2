// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { IStatsPageProps, kStatsPageGray } from "./StatsInterfaces";
import { StatsCard } from "./StatsCard";
import { useProvideDataForExport } from "../../export/exportData";
import { useGetOverviewStats } from "./useGetOverviewStats";
import { FormattedMessage, useIntl } from "react-intl";
import { BookCount } from "../BookCount";

// If we need more control over the icon in the future, use:
//import { ReactComponent as PeopleReachedIcon } from "../assets/Girl.svg";
// This lets us a do a simple <img src={icon} />:
import peopleReachedIcon from "../../assets/Girl.svg";

export const kDarkGrey = "#5d5d5d";

export interface IItem {
    label: string;
    value: number;
    row?: number; //1-based
    excludeFromTotal?: boolean;
}
export const StatsOverviewScreen: React.FunctionComponent<IStatsPageProps> = (
    props
) => {
    const stats = useGetOverviewStats(props);

    const i18n = useIntl();

    props.setBackgroundColor(kStatsPageGray);

    useProvideDataForExport(stats ? [stats] : undefined, props);
    if (!stats) return <React.Fragment />;

    return (
        <div
            // The -10px margin is really ugly but needed to avoid a white bar that is usually imposed by the
            // parent on the left.
            css={css`
                display: flex;
                margin-left: 0;
                margin-right: 0;

                max-width: 800px;
                flex-wrap: wrap;
                // margin between cards
                & > * {
                    margin-right: 20px;
                    margin-bottom: 20px;
                }
            `}
        >
            <StatsCard
                icon={peopleReachedIcon}
                info={i18n.formatMessage({
                    id: "stats.people.reached.info",
                    defaultMessage:
                        "Will overcount when the same person reads one of these books via multiple devices or applications. Will undercount when firewalls or lack of connectivity permanently prevent analytics connections.",
                })}
                subitems={[
                    {
                        label: i18n.formatMessage({
                            id: "stats.reads.web",
                            defaultMessage: "Web",
                        }),
                        value: stats.usersWeb,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "stats.reads.apps",
                            defaultMessage: "Apps",
                        }),
                        value: stats.usersApps,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "bloomReader",
                            defaultMessage: "Bloom Reader",
                        }),
                        value: stats.usersBloomReader,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "bloomPubViewer",
                            defaultMessage: "BloomPUB Viewer",
                        }),
                        value: stats.usersBloomPUBViewer,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "countries",
                            defaultMessage: "Countries",
                        }),
                        value: stats.countries,
                        row: 2,
                        excludeFromTotal: true,
                    },
                ]}
            >
                <FormattedMessage
                    id="stats.people.reached"
                    defaultMessage="People Reached Digitally"
                />
                {/* Need a separate div to put it below the message above. */}
                <div
                    css={css`
                        font-size: 8pt;
                    `}
                >
                    <FormattedMessage
                        id="stats.people.reached.subheader"
                        defaultMessage="(does not count the vast majority of readers, who use paper)"
                    />
                </div>
            </StatsCard>
            <StatsCard
                //  I don't think we're ready for translation on this one yet...
                info={
                    "These statistics are for books that were read during the selected time period. If we have not received any analytics from some books during the selected time period, then 'Books with Analytics' will be smaller than the total number of books. If 'Books with Analytics' is larger than the total, that means that we have analytics for some books that are currently not a part of this collection."
                }
                subitems={[
                    {
                        label: i18n.formatMessage({
                            id: "languages",
                            defaultMessage: "Languages",
                        }),
                        value: stats.languages,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "topics",
                            defaultMessage: "Topics",
                        }),
                        value: stats.topics,
                    },
                    {
                        label: i18n.formatMessage({
                            id: "stats.booksWithAnalytics",
                            defaultMessage: "Books with Analytics",
                        }),
                        value: stats.booksWithAnalytics,
                    },
                ]}
                overrideTotal={() => (
                    <BookCount
                        collection={props.collection}
                        message="{0}" // just show the number
                    ></BookCount>
                )}
            >
                <FormattedMessage id="books" defaultMessage="Books" />
            </StatsCard>

            <StatsCard
                info={i18n.formatMessage({
                    id: "stats.reads.info",
                    defaultMessage:
                        "The number of times a book was read, in part or whole.",
                })}
                subitems={[
                    {
                        label: i18n.formatMessage({
                            id: "stats.reads.web",
                            defaultMessage: "Web",
                        }),
                        value: stats.readsWeb,
                    },
                    // {
                    //     label: i18n.formatMessage({
                    //         id: "stats.reads.apps",
                    //         defaultMessage: "Apps",
                    //     }),
                    //     value: stats.readsApps,
                    // },
                    {
                        label: i18n.formatMessage({
                            id: "bloomReader",
                            defaultMessage: "Bloom Reader",
                        }),
                        value: stats.readsBloomReader,
                    },
                ]}
            >
                <FormattedMessage id="stats.reads" defaultMessage="Reads" />
            </StatsCard>
            <StatsCard
                subitems={[
                    { label: "bloomPUB", value: stats.downloadsBloomPub },
                    { label: "ePUB", value: stats.downloadsEpub },
                    { label: "PDF", value: stats.downloadsPDF },
                    {
                        label: i18n.formatMessage({
                            id: "downloads.forTranslation",
                            defaultMessage: "For Translation",
                        }),
                        value: stats.downloadsShellbooks,
                    },
                ]}
            >
                <FormattedMessage id="downloads" defaultMessage="Downloads" />
            </StatsCard>
        </div>
    );
};
