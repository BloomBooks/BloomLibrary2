import React from "react";
import useAxios from "@use-hooks/axios";
import { InstallerDownload } from "./markdown/InstallerDownload";

export const BloomPUBViewerDownload: React.FunctionComponent<{
    label: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://api.github.com/repos/BloomBooks/bloompub-viewer/releases/latest`,
        method: "GET",
        trigger: "true",
    });

    const downloadUrl = versionRequest?.response?.data?.assets?.filter(
        (asset: any) => asset?.name?.endsWith(".exe")
    )[0]?.browser_download_url;
    const versionNumber = versionRequest?.response?.data.name;
    const publishedDate = versionRequest?.response?.data?.published_at?.substring(
        0,
        10
    );

    return downloadUrl && versionNumber ? (
        <InstallerDownload
            label={props.label || "Download BloomPUB Viewer"}
            url={downloadUrl}
            versionNumber={versionNumber}
            date={publishedDate}
        />
    ) : null;
};
