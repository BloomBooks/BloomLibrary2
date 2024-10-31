import { css } from "@emotion/react";

import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { commonUI } from "../../../theme";
import { IFeatureGroupProps } from "./FeatureGroupCodeSplit";

export const FeatureGroup: React.FunctionComponent<IFeatureGroupProps> = (
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
                        background-color: ${commonUI.colors.resourcesArea};
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

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default FeatureGroup;
