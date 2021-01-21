// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import useAxios, { IReturns } from "@use-hooks/axios";
import { commonUI } from "../../theme";
import { BlorgLink } from "../BlorgLink";
export const WindowsInstallerDownload: React.FunctionComponent<{
    channel: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://s3.amazonaws.com/versions.bloomlibrary.org/latest.${props.channel}.json`,
        method: "GET",
        trigger: "true",
    });

    const info = getInstallerInfo(versionRequest);
    const versionNumber = info.version ?? "0.0.0";
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
                {props.channel === "Release" ? (
                    <Button
                        href={info.url}
                        variant={"contained"}
                        css={css`
                            padding: 16px !important;
                            background-color: ${commonUI.colors
                                .creationArea} !important;
                            /* .MuiButton-label { ENHANCE: how to get this working with the Creation Theme?*/
                            span {
                                color: white;
                                font-size: 24px;
                            }
                        `}
                    >
                        Download
                    </Button>
                ) : (
                    <Button
                        href={info.url}
                        variant="text"
                        color="primary"
                        css={css`
                            padding: 0 !important;
                            span {
                                font-weight: bold;
                                font-size: 14px;
                            }
                        `}
                    >
                        Download Beta
                    </Button>
                )}
                <div
                    css={css`
                        margin-left: 30px;
                    `}
                >
                    <div>{`Version ${versionNumber} ${info.date}`}</div>
                    {info.releaseNotes && (
                        <div>
                            {/* Note, the info.releaseNotes actually gives us a url, but that's a pain to stuff in a url parameter
                            and just isn't needed; as long as we know the channel name, we can construct the url. So that is all we pass here */}
                            <BlorgLink
                                href={"/create/release-notes/" + props.channel}
                            >
                                What's New
                            </BlorgLink>
                        </div>
                    )}
                    <div>
                        <BlorgLink
                            href={"/page/create/bloom-windows-requirements"}
                        >
                            Requirements
                        </BlorgLink>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export function getInstallerInfo(request: IReturns<any>): any {
    return request && request.response ? request.response.data : {};
}
