import { css } from "@emotion/react";

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
    icon?: string;
}> = (props) => {
    let totalAsCompactString = undefined;
    let totalAsFormattedString = undefined;
    let overrideComponent: React.FunctionComponent | undefined = undefined;
    if (typeof props.overrideTotal === "number") {
        totalAsCompactString = formatNumber(props.overrideTotal);
        totalAsFormattedString = props.overrideTotal.toLocaleString();
    } else if (props.overrideTotal === undefined) {
        const v = props.subitems
            ?.map((i) => (i.excludeFromTotal ? 0 : i.value))
            .reduce((t: number, i: number) => t + i, 0);

        totalAsCompactString = formatNumber(v);
        totalAsFormattedString = v?.toLocaleString();
    } else overrideComponent = props.overrideTotal;

    function getSubItemRow(rowNum: number): JSX.Element {
        const subItemsForRow = props.subitems
            ?.filter((i) => {
                if (!i.row || i.row < 1) i.row = 1;
                return i.row === rowNum;
            })
            .map((i) => getSubItem(i));

        return subItemsForRow?.length ? (
            <div
                css={css`
                    display: flex;
                    margin-top: ${rowNum === 1 ? "auto" : "10px"};
                `}
            >
                {subItemsForRow}
            </div>
        ) : (
            <React.Fragment />
        );
    }

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
                    height: 230px;

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
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `}
                >
                    {props.icon && (
                        <div
                            css={css`
                                line-height: 0;
                                height: 60px;
                                width: 60px; // define its width
                                margin-inline-end: 15px; // give it margin to give space between it and the total
                                margin-inline-start: -75px; // now move it over the sum of the previous two so the total can stay centered
                            `}
                        >
                            <img
                                src={props.icon}
                                css={css`
                                    height: 60px;
                                    width: 60px;
                                    object-fit: contain;
                                `}
                                alt=""
                            />
                        </div>
                    )}
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
                </div>
                {getSubItemRow(1)}
                {getSubItemRow(2)}
            </CardContent>
        </Card>
    );
};

function getSubItem(i: IItem): JSX.Element {
    return (
        <div
            key={i.label}
            css={css`
                margin-right: 20px;
                &:last-child {
                    margin-right: 0;
                }

                max-width: max-content;

                &,
                * {
                    text-align: left;
                }
            `}
        >
            <div
                css={css`
                    color: ${kDarkGrey};
                    font-size: 11px;

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
                    line-height: 1;
                `}
                title={Intl.NumberFormat([]).format(i.value)}
            >
                {formatNumber(i.value)}
            </div>
        </div>
    );
}

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
