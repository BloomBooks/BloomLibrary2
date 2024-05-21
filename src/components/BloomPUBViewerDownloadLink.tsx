import React from "react";
import useAxios from "@use-hooks/axios";
import { FormattedMessage } from "react-intl";
import { BlorgLink } from "./BlorgLink";

export const BloomPUBViewerDownloadLink: React.FunctionComponent<{
    channel: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://api.github.com/repos/BloomBooks/bloompub-viewer/releases/latest`,
        method: "GET",
        trigger: "true",
    });

    const versionNumber = versionRequest?.response?.data.name;
    const downloadUrl = versionRequest?.response?.data?.assets?.filter(
        (asset: any) => asset?.name?.endsWith(".exe")
    )[0]?.browser_download_url;

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
