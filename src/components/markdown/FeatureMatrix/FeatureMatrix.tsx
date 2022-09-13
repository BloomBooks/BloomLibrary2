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
import { commonUI } from "../../../theme";
import { useResponsiveChoice } from "../../../responsiveUtilities";
import { IFeatureMatrixProps } from "./FeatureMatrixCodeSplit";

const backgroundColor = "white";
const headerColor = commonUI.colors.createAreaTextOnWhite;

export const FeatureMatrix: React.FunctionComponent<IFeatureMatrixProps> = (
    props
) => {
    const getResponsiveChoice = useResponsiveChoice();
    return (
        <TableContainer
            component={Paper}
            css={css`
                background-color: ${backgroundColor}!important;
                margin-left: auto;
                margin-right: auto;
                width: ${getResponsiveChoice("", "fit-content")} !important;
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
                        padding-left: 0;
                    }
                    .levelName,
                    .feature {
                        font-size: ${getResponsiveChoice(10, 14)}px;
                        line-height: 1em;
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
                        <TableCell className="levelName" align="center">
                            {props.freeLabel || "Free"}
                        </TableCell>
                        <TableCell className="levelName" align="center">
                            {props.communityLabel || "Local Community"}
                        </TableCell>
                        <TableCell className="levelName" align="center">
                            {props.enterpriseLabel || "Enterprise"}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{props.children}</TableBody>
            </Table>
        </TableContainer>
    );
};

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default FeatureMatrix;
