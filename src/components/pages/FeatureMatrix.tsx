// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { commonUI } from "../../theme";
import IconButton from "@material-ui/core/IconButton";
import Check from "@material-ui/icons/Check";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Collapse from "@material-ui/core/Collapse";

const backgroundColor = "white";
const headerColor = commonUI.colors.createAreaTextOnWhite;

const blockColor = "white";
const defaultColor = "black";
const columOneWidth = "auto";

export const FeatureMatrix: React.FunctionComponent<{}> = (props) => {
    return (
        <TableContainer
            component={Paper}
            css={css`
                background-color: ${backgroundColor}!important;
                margin-left: auto;
                margin-right: auto;
                width: fit-content !important;
            `}
        >
            <Table
                aria-label="feature matrix"
                size="small" // makes dense
                css={css`
                    width: auto !important;
                    .MuiTableCell-head {
                        color: ${headerColor} !important;
                    }
                    th,
                    td {
                        border: none !important;
                    }
                `}
            >
                <TableHead>
                    <TableRow
                        css={css`
                            * {
                                color: ${headerColor} !important;
                                font-weight: bold !important;

                                vertical-align: bottom !important;
                            }
                        `}
                    >
                        <TableCell></TableCell>
                        <TableCell align="center">Free</TableCell>
                        <TableCell align="center">Local Community</TableCell>
                        <TableCell align="center">Enterprise</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{props.children}</TableBody>
            </Table>
        </TableContainer>
    );
};

export const FeatureGroup: React.FunctionComponent<{ name: string }> = (
    props
) => {
    return (
        <React.Fragment>
            <TableRow key={props.name} css={css``}>
                <TableCell
                    colSpan={99}
                    scope="row"
                    css={css`
                        color: white !important;
                        background-color: ${commonUI.colors.creationArea};
                    `}
                >
                    <span
                        css={css`
                            width: 30px;
                            display: inline-block;
                        `}
                    ></span>
                    {props.name}
                </TableCell>
            </TableRow>
            {props.children}
        </React.Fragment>
    );
};

export const Feature: React.FunctionComponent<{
    name: string;
    community: boolean;
    enterprise: boolean;
}> = (props) => {
    const [open, setOpen] = React.useState(false);
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
                `}
            >
                <TableCell
                    component="th"
                    scope="row"
                    css={css`
                        width: ${columOneWidth};
                        font-weight: 600 !important;
                        font-size: 1rem !important;
                        &,
                        * {
                            color: ${defaultColor};
                        }
                    `}
                >
                    <span
                        css={css`
                            width: 30px;
                            display: inline-block;
                        `}
                    >
                        {hasChildren && (
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
                        )}
                    </span>
                    {props.name}
                </TableCell>
                <TableCell align="center">{all && <Check />}</TableCell>
                <TableCell align="center">
                    {(all || props.community) && <Check />}
                </TableCell>
                <TableCell align="center">
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
                    `}
                >
                    {/* This is the mardown content that describes the feature */}
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
