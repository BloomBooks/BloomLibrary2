// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { IItem, kDarkGrey } from "./StatsOverviewScreen";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { IconButton } from "@material-ui/core";
import Tooltip from "react-tooltip-lite";

export const StatsCard: React.FunctionComponent<{
    overrideTotal?: number | React.FunctionComponent;
    subitems?: IItem[];
    info?: string;
}> = (props) => {
    let totalAsCompactString = undefined;
    let totalAsFormattedString = undefined;
    let overrideComponent: React.FunctionComponent | undefined = undefined;
    if (typeof props.overrideTotal === "number") {
        totalAsCompactString = formatNumber(props.overrideTotal);
        totalAsFormattedString = props.overrideTotal.toLocaleString();
    } else if (props.overrideTotal === undefined) {
        const v = props.subitems
            ?.map((i) => i.value)
            .reduce((t: number, i: number) => t + i, 0);

        totalAsCompactString = formatNumber(v);
        totalAsFormattedString = v?.toLocaleString();
    } else overrideComponent = props.overrideTotal;

    return (
        <Card
            key={props.children?.toString()}
            css={css`
                width: 350px;

                * {
                    text-align: center;
                }
            `}
        >
            <CardContent
                css={css`
                    padding: 16px;
                    // Override MuiCardContent default which gives the last child (thus the card) a bottom of 24px.
                    :last-child {
                        padding-bottom: 16px;
                    }
                    height: 200px;

                    display: flex;
                    flex-direction: column;
                    // get the info icon in the upper left
                    position: relative;
                    .infoTooltip {
                        position: absolute !important;
                        top: 0;
                        right: 0;
                        span {
                            color: ${kDarkGrey};
                        }
                    }
                `}
            >
                {props.info && (
                    <Tooltip
                        className={"infoTooltip"}
                        content={props.info}
                        arrow
                        useDefaultStyles
                    >
                        <IconButton>
                            <InfoIcon></InfoIcon>
                        </IconButton>
                    </Tooltip>
                )}
                <div
                    css={css`
                        &,
                        * {
                            font-size: 20px;
                            color: ${kDarkGrey};
                        }
                    `}
                >
                    {props.children}
                </div>
                <div
                    css={css`
                        font-size: 48px;
                        font-weight: bold;
                        margin-bottom: 0;
                    `}
                    title={totalAsFormattedString}
                >
                    {/* overrideTotal can be either a number or a function supplying a react component*/}
                    {totalAsCompactString || overrideComponent!({})}
                </div>
                <div
                    css={css`
                        display: flex;
                        flex-direction: row;
                        margin-top: auto;
                    `}
                >
                    {props.subitems?.map((i) => (
                        // One sub item
                        <div
                            key={i.label}
                            css={css`
                                margin-right: 10px;
                                min-width: 60px;

                                &,
                                * {
                                    text-align: left;
                                }
                            `}
                        >
                            <div
                                css={css`
                                    color: ${kDarkGrey};
                                    font-size: 12px;

                                    vertical-align: bottom;
                                    display: table-cell;
                                `}
                            >
                                {i.label}
                            </div>
                            <div
                                css={css`
                                    font-size: 24px;
                                    font-weight: bold;
                                `}
                                title={Intl.NumberFormat([]).format(i.value)}
                            >
                                {formatNumber(i.value)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

function formatNumber(i: number | undefined): string {
    if (i === undefined) {
        return "0";
    }
    // note, sadly, Chrome does not implement the "rounding" option, so this will
    // sometimes round *up*, which I think is undesirable. We do show the exact
    // number as a tooltip and mention this in the info at the bottom of the screen.
    return Intl.NumberFormat([], { notation: "compact" })
        .format(i)
        .replace("K", "k");
}
