import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

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
