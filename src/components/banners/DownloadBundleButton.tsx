import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import Button from "@material-ui/core/Button";
import GetApp from "@material-ui/icons/GetApp";
import { commonUI } from "../../theme";

// Note, there are two kinds of bundles: BloomBundle (should have named it
// BloomPUBBundle) and BloomPack (should have named it BloomSourceBundle or
// BloomSourcePack) This button works for both of them.
export const DownloadBundleButton: React.FunctionComponent<{
    url: string;
    children: string;
}> = (props) => {
    return (
        <Button
            startIcon={<GetApp />}
            variant="outlined"
            color="primary"
            size="large"
            css={css`
                &,
                * {
                    line-height: initial;
                    text-decoration: none !important;
                    color: ${commonUI.colors.bloomRed};
                    font-size: 12px;
                }

                &,
                &:hover {
                    width: fit-content;
                    margin-top: 10px;

                    border-width: 2px;
                    border-color: ${commonUI.colors.bloomRed};
                }
            `}
            href={props.url}
        >
            {props.children}
        </Button>
    );
};
