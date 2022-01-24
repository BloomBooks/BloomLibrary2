// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { BlorgLink } from "../BlorgLink";
import React from "react";

export const StatsCredits = () => {
    return (
        <div>
            <h4
                css={css`
                    margin-bottom: 0;
                `}
            >
                Credits
            </h4>
            This site or product includes IP2Location LITE data available from{" "}
            <BlorgLink href="https://lite.ip2location.com">
                https://lite.ip2location.com
            </BlorgLink>
            .
        </div>
    );
};
