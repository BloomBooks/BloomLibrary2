import { css } from "@emotion/react";

import * as React from "react";
import UseAxios from "axios-hooks";
import { toYyyyMmDd } from "../../Utilities";
import { BlorgLink } from "../BlorgLink";
// @ts-ignore
import parser from "xml2json-light";

export const AllBloomInstallers: React.FunctionComponent<{}> = (props) => {
    const [{ response, loading, error }] = UseAxios({
        url: "https://s3.amazonaws.com/bloomlibrary.org?prefix=installers/",
        method: "GET",
    });
    if (error) {
        return <div>{error}</div>;
    }
    if (loading) {
        return <div>Loading...</div>;
    }
    const json = parser.xml2json(response!.data);

    // sort newest first
    const installers = json.ListBucketResult.Contents.sort((a: any, b: any) => {
        return (
            new Date(b.LastModified).getTime() -
            new Date(a.LastModified).getTime()
        );
    });

    return (
        <table
            css={css`
                td {
                    min-width: 20em;
                }
            `}
        >
            {installers.map((installer: any) => {
                if (installer.Key.indexOf("installers/Bloom") === 0) {
                    return (
                        <tr>
                            <td>
                                <BlorgLink
                                    href={`https://www.bloomlibrary.org/${installer.Key}`}
                                >
                                    {installer.Key.replace("installers/", "")}
                                </BlorgLink>
                            </td>
                            <td>
                                {toYyyyMmDd(new Date(installer.LastModified))}
                            </td>
                        </tr>
                    );
                } else return undefined;
            })}
        </table>
    );
};
