// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";
import { ICollectionStatsResponse } from "./DataStudioDasboardScreen";
import { IScreenProps, kStatsPageGray } from "./CollectionStatsPage";

export interface IOverviewStats {
    devices: number;
    languages: number;
}

// Temporary for testing
function getFakeCollectionStats(): IOverviewStats {
    return {
        devices: 1072,
        languages: 35,
    };
}

const gapWidth = "10px";

export const StatsOverviewScreen: React.FunctionComponent<IScreenProps> = (
    props
) => {
    const stats = getFakeCollectionStats(); // todo: get real data
    return (
        <div
            // The -10px margin is really ugly but needed to avoid a white bar that is usually imposed by the
            // parent on the left.
            css={css`
                display: flex;
                background-color: ${kStatsPageGray};
                margin-left: -10px;
                padding: ${gapWidth};
            `}
        >
            <div
                css={css`
                    color: ${commonUI.colors.bloomRed};
                    margin-right: ${gapWidth};
                    background-color: white;
                    padding: 10px;
                `}
            >
                <div
                    css={css`
                        padding-top: 5px;
                        display: flex;
                        justify-content: space-around;
                    `}
                >
                    Devices
                </div>
                <div
                    css={css`
                        display: flex;
                        justify-content: space-around;
                        font-size: smaller;
                    `}
                >
                    with Bloom Reader
                </div>
                <div
                    css={css`
                        display: flex;
                        justify-content: space-around;
                        font-size: larger;
                        margin-top: 15px;
                    `}
                >
                    {stats.devices}
                </div>
            </div>
            <div
                css={css`
                    color: ${commonUI.colors.bloomRed};
                    margin-right: ${gapWidth};
                    background-color: white;
                    padding: 10px;
                `}
            >
                <div
                    css={css`
                        padding-top: 5px;
                        display: flex;
                        justify-content: space-around;
                    `}
                >
                    Languages
                </div>
                <div
                    css={css`
                        display: flex;
                        justify-content: space-around;
                        font-size: larger;
                        margin-top: 15px;
                    `}
                >
                    {stats.languages}
                </div>
            </div>
        </div>
    );
};
