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
import { FormattedMessage } from "react-intl";
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
                        <FormattedMessage
                            // Unfortunate id, but it already existed, and we don't want a new one.
                            id="book.metadata.download"
                            defaultMessage="Download"
                        />
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
                        <FormattedMessage
                            id="download.beta"
                            defaultMessage="Download Beta"
                        />
                    </Button>
                )}
                <div
                    css={css`
                        margin-left: 30px;
                    `}
                >
                    <div>
                        <FormattedMessage
                            id="download.versionInfo"
                            defaultMessage="Version {versionNumber} {date}"
                            values={{ versionNumber, date: info.date }}
                        />
                    </div>
                    <div>
                        <BlorgLink href={getReleaseNotesLink(info)}>
                            <FormattedMessage
                                id="download.linkToReleaseNotes"
                                defaultMessage="What's New"
                            />
                        </BlorgLink>
                    </div>
                    <div>
                        <BlorgLink
                            href={"/page/create/bloom-windows-requirements"}
                        >
                            <FormattedMessage
                                id="download.linkToRequirements"
                                defaultMessage="Requirements"
                            />
                        </BlorgLink>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

function getReleaseNotesLink(info: any) {
    let releaseNotesLink = "https://docs.bloomlibrary.org/release-notes";
    if (info?.version) {
        const versionArray = info.version.split(".");
        if (versionArray.length >= 2) {
            versionArray.splice(2); // just major and minor
            releaseNotesLink += `-${versionArray.join("-")}`;
        }
    }
    return releaseNotesLink;
}

export function getInstallerInfo(request: IReturns<any>): any {
    return request && request.response ? request.response.data : {};
}
