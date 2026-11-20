import { css } from "@emotion/react";

import React from "react";
import { isUsingStagingApi } from "../connection/ApiConnection";

// Shown while this browser sends its API calls to staging (see getApiChoice()), so a tester
// doesn't forget they turned it on, and can switch back.
export const StagingApiNotice: React.FunctionComponent<{}> = () => {
    if (!isUsingStagingApi()) {
        return null;
    }
    return (
        <div
            css={css`
                position: fixed;
                left: 8px;
                bottom: 8px;
                z-index: 2000;
                padding: 4px 10px;
                border-radius: 4px;
                background-color: #b35c00;
                color: white;
                font-size: 12px;
                a {
                    color: inherit;
                }
            `}
        >
            Using the staging API · <a href="?api=prod">Switch back</a>
        </div>
    );
};

export default StagingApiNotice;
