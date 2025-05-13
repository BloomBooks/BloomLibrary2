import { css } from "@emotion/react";

import React from "react";
import { Img } from "react-image";
import { Tooltip } from "@material-ui/core";

interface IProps {
    credits?: string;
    // the following should come from react-image ImgProps but there's some problem with their typings
    src: string;
    alt?: string;
    loader?: JSX.Element | null;
    unloader?: JSX.Element | null;
}

// This is just like an Img, but with the additional credits property.
// when the image is hovered over, after a second a tooltip shows the credits.
export const ImgWithCredits: React.FunctionComponent<IProps> = (props) => {
    return (
        <Tooltip
            // didn't work: classes={{ popper: "popper", tooltip: "tooltip" }}
            title={props.credits || ""}
            css={css`
                /* didn't work .tooltip {
                            border: solid blue !important;
                            background-color: black;
                        } */
                color: white;
            `}
            placement="bottom"
            enterDelay={1000}
        >
            <div
                css={css`
                    //width: 100%;
                    display: flex;
                `}
            >
                {/* I'd rather not have this div wrapper, but the tooltip won't work with
                the Img as a direct child. Apparently the direct child of a Tooltip must be
                something that "can hold a ref". */}
                <Img {...props} />
            </div>
        </Tooltip>
    );
};
