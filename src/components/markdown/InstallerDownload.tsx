// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import Button from "@material-ui/core/Button";
import { commonUI } from "../../theme";
import { BlorgLink } from "../BlorgLink";
import { FormattedMessage } from "react-intl";
export const InstallerDownload: React.FunctionComponent<{
    label: string | JSX.Element;
    url: string;
    versionNumber: string;
    date: string;
    buttonStyle?: "normal" | "large";
    releaseNotesUrl?: string;
    requirementsUrl?: string;
}> = (props) => {
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
                {props.buttonStyle === "large" ? (
                    <Button
                        href={props.url}
                        variant={"contained"}
                        css={css`
                            padding: 16px !important;
                            background-color: ${commonUI.colors
                                .resourcesArea} !important;
                            /* .MuiButton-label { ENHANCE: how to get this working with the Resources Theme?*/
                            span {
                                color: white;
                                font-size: 24px;
                            }
                        `}
                    >
                        {props.label}
                    </Button>
                ) : (
                    <Button
                        href={props.url}
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
                        {props.label}
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
                            values={{
                                versionNumber: props.versionNumber,
                                date: props.date,
                            }}
                        />
                    </div>
                    {props.releaseNotesUrl && (
                        <div>
                            <BlorgLink href={props.releaseNotesUrl}>
                                <FormattedMessage
                                    id="download.linkToReleaseNotes"
                                    defaultMessage="What's New"
                                />
                            </BlorgLink>
                        </div>
                    )}
                    {props.requirementsUrl && (
                        <div>
                            <BlorgLink href={props.requirementsUrl}>
                                <FormattedMessage
                                    id="download.linkToRequirements"
                                    defaultMessage="Requirements"
                                />
                            </BlorgLink>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};
