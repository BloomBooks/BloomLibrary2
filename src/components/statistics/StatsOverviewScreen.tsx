// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { IStatsProps } from "./StatsInterfaces";

export interface IOverviewStats {
    devices: number;
    languages: number;
}

// Temporary for testing
function getFakeCollectionStats(props: IStatsProps): IOverviewStats {
    return {
        devices: 1072,
        languages: 35,
    };
}

const gapWidth = "10px";
const kDarkGrey = "#5d5d5d";

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
                background-color: ${kDarkGrey};
                margin-left: 0;
                margin-right: 0;
                padding: ${gapWidth};
            `}
        >
            <StatsCard value={stats.devices.toString()}>
                Devices
                <div
                    css={css`
                        font-size: 12px;
                    `}
                >
                    with Bloom Reader
                </div>
            </StatsCard>
            <StatsCard value={stats.languages.toString()}>Languages</StatsCard>
        </div>
    );
};

const StatsCard: React.FunctionComponent<{ value: string }> = (props) => (
    <Card
        css={css`
            margin-right: 15px;

            * {
                text-align: center;
            }
        `}
    >
        <CardContent
            css={css`
                padding: 16px;

                height: 86px;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
            `}
        >
            <div
                css={css`
                    color: ${kDarkGrey};
                `}
            >
                {props.children}
            </div>
            <h1>{props.value}</h1>
        </CardContent>
    </Card>
);
