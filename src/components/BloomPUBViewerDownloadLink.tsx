import React from "react";
import useAxios from "@use-hooks/axios";
import { FormattedMessage } from "react-intl";
import { BlorgLink } from "./BlorgLink";

export const BloomPUBViewerDownloadLink: React.FunctionComponent<{
    channel: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://bloomlibrary.org/assets/bloomPUBViewerInstallerInfo.json`,
        method: "GET",
        trigger: "true",
    });

    const versionNumber = versionRequest?.response?.data.versionNumber;
    const downloadUrl = versionRequest?.response?.data.downloadUrl;
    return versionNumber && downloadUrl ? (
        <BlorgLink href={downloadUrl}>
            <FormattedMessage
                id="download.version"
                defaultMessage="Download version {versionNumber}."
                values={{ versionNumber }}
            />
        </BlorgLink>
    ) : null;
};
