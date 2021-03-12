// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { IStatsProps } from "./StatsInterfaces";
import { StatsCard } from "./StatsCard";
import { useProvideDataForExport } from "../../export/exportData";
import { useGetOverviewStats } from "./useGetOverviewStats";
import { FormattedMessage, useIntl } from "react-intl";

//const gapWidth = "10px";
export const kDarkGrey = "#5d5d5d";

export interface IItem {
    label: string;
    value: number;
}
export const StatsOverviewScreen: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const stats = useGetOverviewStats(props);

    const i18n = useIntl();

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
                    "These statistics are for books that were read during the time period. This may be different from the count of books in the collection, if some books were not read during the time period, or if some books were removed from the collection."
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
                ]}
                overrideTotal={stats.books}
            >
                <FormattedMessage id="books" defaultMessage="Books" />
            </StatsCard>

            <StatsCard
                info={i18n.formatMessage({
                    id: "stats.devices.info",
                    defaultMessage:
                        "Count of devices for which we received notice that at least one book from this collection had been loaded.",
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
                        "The number of times the book was read, in part or whole. We are currently only showing reads on Bloom Reader. We will soon add reads on the Web, in apps, and in the desktop.",
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
                    { label: "bloomPub", value: stats.downloadsBloomPub },
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
