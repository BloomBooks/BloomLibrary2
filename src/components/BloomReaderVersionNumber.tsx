import React from "react";
import useAxios from "@use-hooks/axios";
import { FormattedMessage } from "react-intl";

export const BloomReaderVersionNumber: React.FunctionComponent<{
    channel: string;
}> = (props) => {
    const versionRequest = useAxios({
        url: `https://bloomlibrary.org/assets/bloomReaderVersionNumber.txt`,
        method: "GET",
        trigger: "true",
    });

    const versionNumber = versionRequest?.response?.data;
    return versionNumber ? (
        <FormattedMessage
            id="version.number.parenthetical"
            defaultMessage="(version {versionNumber})"
            values={{ versionNumber }}
        />
    ) : null;
};
