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
import { IconButton, Tooltip } from "@material-ui/core";
import { kStatsPageGray } from "./CollectionStatsPage";

export const StatsCard: React.FunctionComponent<{
    overrideTotal?: number;
    subitems?: IItem[];
    info?: string;
}> = (props) => (
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
                padding-top: unset;
                padding-bottom: unset;
                padding-left: unset;
                padding-right: unset;
                padding: 24px;

                height: 150px;

                display: flex;
                flex-direction: column;
                // get the info icon in the upper left
                position: relative;
                .MuiIconButton-root {
                    position: absolute;
                    top: 0;
                    right: 0;
                    span {
                        color: ${kStatsPageGray};
                    }
                }
            `}
        >
            {props.info && (
                <Tooltip
                    title={props.info}
                    arrow
                    css={css`
                        * {
                            //background-color: yellow;
                        }
                    `}
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
            >
                {props.overrideTotal
                    ? props.overrideTotal
                    : props.subitems
                          ?.map((i) => i.value)
                          // The plusses in front of t and i make these add like numbers
                          // instead of concatenate like strings
                          .reduce((t: number, i: number) => +t + +i, 0)}
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
                        >
                            {i.value}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);
