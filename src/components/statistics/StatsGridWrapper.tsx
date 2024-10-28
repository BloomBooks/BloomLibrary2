// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";

export const StatsGridWrapper: React.FunctionComponent<{
    stats?: Array<any>;
}> = (props) => {
    const gotRows = !!props.stats && props.stats.length > 0;
    return (
        <div
            css={css`
                background-color: ${gotRows && "white"};
                thead.MuiTableHead-root * {
                    line-height: 15px;
                    vertical-align: top;
                }
                // make the table line up with the rest of the page
                // (but don't interfere with the space between columns)
                th:first-child,
                td:first-child {
                    padding-left: 0 !important;
                }
                padding: 10px;
            `}
        >
            {gotRows || <div>No data found</div>}
            {gotRows && props.children}
        </div>
    );
};
