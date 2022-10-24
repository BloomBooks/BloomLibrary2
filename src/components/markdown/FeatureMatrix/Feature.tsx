// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Check from "@material-ui/icons/Check";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Collapse from "@material-ui/core/Collapse";
import { useResponsiveChoice } from "../../../responsiveUtilities";
import { IFeatureProps } from "./FeatureCodeSplit";

const blockColor = "white";
const defaultColor = "black";
const columOneWidth = "auto";

export const Feature: React.FunctionComponent<IFeatureProps> = (props) => {
    const [open, setOpen] = React.useState(false);
    const getResponsiveChoice = useResponsiveChoice();
    const all = !(props.community || props.enterprise);
    const hasChildren = React.Children.count(props.children) > 0;
    return (
        <React.Fragment>
            <TableRow
                className={"feature"}
                key={props.name}
                css={css`
                    border: none;
                    .MuiTableCell-body {
                        color: ${defaultColor};
                    }
                    background-color: ${blockColor};

                    .checkMarkHolder {
                        svg {
                            height: ${getResponsiveChoice(16, 24)}px;
                        }
                    }
                `}
            >
                {/* 1st column, feature label */}
                <TableCell
                    // @ts-ignore:next-line
                    component={"th"}
                    scope="row"
                    css={css`
                        /* width: ${columOneWidth}; */
                        font-weight: 600 !important;
                        font-size: ${getResponsiveChoice(10, 16)}px !important;
                        &,
                        * {
                            color: ${defaultColor};
                        }
                        display: flex;
                    `}
                >
                    <span
                        css={css`
                            width: 30px;
                            display: inline-block;
                        `}
                    >
                        {hasChildren ? (
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                css={css`
                                    padding-bottom: 6px !important;
                                `}
                                onClick={() => setOpen(!open)}
                            >
                                {open ? (
                                    <KeyboardArrowUpIcon />
                                ) : (
                                    <KeyboardArrowDownIcon />
                                )}
                            </IconButton>
                        ) : (
                            // just take up that space so that if the feature
                            // label is really long and wrap, it won't take up
                            // this space and fall out of alignment
                            <div
                                css={css`
                                    padding: 0;
                                    margin: 0;
                                `}
                            ></div>
                        )}
                    </span>
                    <div
                        css={css`
                            padding-top: 8px;
                        `}
                    >
                        {props.name}
                    </div>
                </TableCell>
                <TableCell className="checkMarkHolder" align="center">
                    {all && <Check />}
                </TableCell>
                <TableCell className="checkMarkHolder" align="center">
                    {(all || props.community) && <Check />}
                </TableCell>
                <TableCell className="checkMarkHolder" align="center">
                    {(all || props.community || props.enterprise) && <Check />}
                </TableCell>
            </TableRow>
            <TableRow
                css={css`
                    border: none;
                `}
            >
                <TableCell
                    colSpan={4}
                    css={css`
                        padding-bottom: 0;
                        padding-top: 0;
                        width: 300px;
                        font-size: ${getResponsiveChoice(10, 16)}px !important;
                        padding-left: 10px !important; // see "Record by sentence"
                    `}
                >
                    {/* This is the markdown content that describes the feature */}
                    {hasChildren && (
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            {props.children}
                        </Collapse>
                    )}
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default Feature;
