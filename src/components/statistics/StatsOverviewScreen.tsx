// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useEffect } from "react";
import { IStatsProps } from "./StatsInterfaces";
import { StatsCard } from "./StatsCard";
import { useGetOverviewStats } from "./useGetOverviewStats";

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
    if (!stats) return <React.Fragment />;
    useEffect(
        () => {
            return props.registerExportDataFn(() => {
                const headerRow = Object.keys(stats);
                const valueRow = Object.values(stats).map((v) =>
                    v.toString()
                ) as string[];
                const all: string[][] = [];
                all[0] = headerRow;
                all[1] = valueRow;
                return all;
            });
        },
        [] /* todo*/
    );

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
                subitems={[
                    { label: "Languages", value: stats.languages },
                    { label: "Topics", value: stats.topics },
                ]}
                overrideTotal={stats.books}
            >
                Books
            </StatsCard>

            <StatsCard
                info={
                    "Count of devices where we received notice where at least on book from this collection had been loaded."
                }
                subitems={[
                    { label: "Mobile", value: stats.bloomPubDeviceMobile },
                    { label: "PC", value: stats.bloomPubDevicePC },
                ]}
            >
                Devices
                <div
                    css={css`
                        font-size: 12px;
                    `}
                >
                    with Bloom Reader
                </div>
            </StatsCard>

            <StatsCard
                subitems={[
                    { label: "Web", value: stats.readsWeb },
                    { label: "Apps", value: stats.readsApps },
                    { label: "Bloom Reader", value: stats.readsBloomReader },
                ]}
            >
                Reads
            </StatsCard>
            <StatsCard
                subitems={[
                    { label: "bloomPub", value: stats.downloadsBloomPub },
                    { label: "ePUB", value: stats.downloadsEpub },
                    { label: "PDF", value: stats.downloadsPDF },
                    {
                        label: "For Translation",
                        value: stats.downloadsShellbooks,
                    },
                ]}
            >
                Downloads
            </StatsCard>
        </div>
    );
};
