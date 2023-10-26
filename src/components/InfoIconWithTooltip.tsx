import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

export const InfoIconWithTooltip: React.FunctionComponent<{
    children: NonNullable<React.ReactNode>;
}> = (props) => (
    <Tooltip title={props.children || ""}>
        <InfoIcon
            css={css`
                font-size: 12px;
                margin-bottom: -2px; // needed to be inline with prior text
            `}
        />
    </Tooltip>
);
