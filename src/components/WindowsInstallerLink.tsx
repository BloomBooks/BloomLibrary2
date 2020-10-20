// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import useAxios from "@use-hooks/axios";
import Link from "@material-ui/core/Link";
export const WindowsInstallerLink: React.FunctionComponent<{
    channel: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://s3.amazonaws.com/versions.bloomlibrary.org/latest.${props.channel}.json`,
        method: "GET",
        trigger: "true",
    });

    const info =
        versionRequest && versionRequest.response
            ? versionRequest.response.data
            : {};
    const versionNumber = info.version ?? "0.0.0";
    const linkText = props.children!.toString().replace("{version}", versionNumber)
    return (
        <React.Fragment>
            <div
                css={css`
                    display: flex;
                    flex-direction: row;
                    margin-top: 14px;
                    align-items: start;
                `}
            >
                {props.channel === "CS" &&
                    <div>
                        <Link href={info.url}>{linkText}</Link>
                    </div>
                }
            </div>
        </React.Fragment>
    );
};
