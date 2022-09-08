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

//const gapWidth = "10px";
export const kDarkGrey = "#5d5d5d";

export interface IItem {
    label: string;
    value: number;
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
                            id: "books-with-analytics",
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
                    id: "stats.devices.info",
                    defaultMessage:
                        "Count of devices for which we received notice that at least one book from this collection had been read.",
                })}
                overrideTotal={stats.bloomPubDeviceMobile}
                // subitems={[
                //     {
                //         label: i18n.formatMessage({
                //             id: "stats.devices.mobile",
                //             defaultMessage: "Mobile",
                //         }),
                //         value: stats.bloomPubDeviceMobile,
                //     },
                // {
                //     label: i18n.formatMessage({
                //         id: "stats.devices.pc",
                //         defaultMessage: "PC",
                //     }),
                //     value: stats.bloomPubDevicePC,
                // },
                // ]}
            >
                <FormattedMessage id="devices" defaultMessage="Devices" />
                <div
                    css={css`
                        font-size: 12px;
                    `}
                >
                    <FormattedMessage
                        id="stats.devices.bloomReader"
                        defaultMessage="with Bloom Reader"
                    />
                </div>
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
