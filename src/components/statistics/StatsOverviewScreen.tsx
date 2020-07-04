// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { IStatsProps } from "./StatsInterfaces";
import { StatsCard } from "./StatsCard";

export interface IOverviewStats {
    books: number;
    languages: number;
    topics: number;

    bloomPubDeviceMobile: number;
    bloomPubDevicePC: number;

    downloadsEpub: number;
    downloadsBloomPub: number;
    downloadsPDF: number;
    downloadsShellbooks: number;

    readsWeb: number;
    readsApps: number;
    readsBloomReader: number;
}

// Temporary for testing
function getFakeCollectionStats(props: IStatsProps): IOverviewStats {
    return {
        books: 67,
        languages: 4,
        topics: 5,

        bloomPubDeviceMobile: 234,
        bloomPubDevicePC: 12,

        downloadsEpub: 123,
        downloadsBloomPub: 234,
        downloadsPDF: 82,
        downloadsShellbooks: 12,

        readsWeb: 1024,
        readsApps: 22,
        readsBloomReader: 99,
    };
}

const gapWidth = "10px";
export const kDarkGrey = "#5d5d5d";

export interface IItem {
    label: string;
    value: number;
}
export const StatsOverviewScreen: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const stats = getFakeCollectionStats(props);
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
