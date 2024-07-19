import React from "react";
import useAxios, { IReturns } from "@use-hooks/axios";
import { FormattedMessage } from "react-intl";
import { InstallerDownload } from "./InstallerDownload";
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
    return props.channel === "Release" ? (
        <InstallerDownload
            buttonStyle="large"
            label={
                <FormattedMessage
                    // Unfortunate id, but it already existed, and we don't want a new one.
                    id="book.metadata.download"
                    defaultMessage="Download"
                />
            }
            url={info.url}
            versionNumber={versionNumber}
            date={info.date}
            releaseNotesUrl={getReleaseNotesLink(info)}
            requirementsUrl={"/page/resources/bloom-windows-requirements"}
        />
    ) : (
        <InstallerDownload
            label={
                <FormattedMessage
                    id="download.beta"
                    defaultMessage="Download Beta"
                />
            }
            url={info.url}
            versionNumber={versionNumber}
            date={info.date}
            releaseNotesUrl={getReleaseNotesLink(info)}
            requirementsUrl={"/page/resources/bloom-windows-requirements"}
        />
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
