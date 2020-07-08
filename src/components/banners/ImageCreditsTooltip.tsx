import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { Button, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

export const ImageCreditsTooltip: React.FunctionComponent<{
    imageCredits: React.ReactNode;
}> = (props) => (
    <Tooltip
        // didn't work: classes={{ popper: "popper", tooltip: "tooltip" }}
        title={props.imageCredits}
        css={css`
            /* didn't work .tooltip {
                            border: solid blue !important;
                            background-color: black;
                        } */
            color: white;
        `}
        placement="left-end"
    >
        <Button
            aria-label="Image Credits"
            css={css`
                padding: 0;
                margin-left: auto !important;
                margin-top: auto !important;
            `}
        >
            <InfoIcon
                css={css`
                    color: white;
                `}
                fontSize="small"
            />
        </Button>
    </Tooltip>
);
