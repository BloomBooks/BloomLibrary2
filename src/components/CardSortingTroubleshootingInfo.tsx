import { css } from "@emotion/react";

import React from "react";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";

// this can be used when testing sorting to give info on sort keys and dates, so that you can see if the
// card is sorting like you expect.
export const CardSortingTroubleshootingInfo: React.FunctionComponent<{
    title: string;
    book: IBasicBookInfo;
}> = (props) => {
    const lastUploaded = props.book.lastUploaded?.iso.substring(0, 10);
    const createdAt = props.book.createdAt.substring(0, 10);
    const sortKey = (props.book as any).sortKey || "";

    return (
        <div
            css={css`
                font-size: 7pt;
            `}
        >
            <div>
                <span
                    css={css`
                        color: ${sortKey === props.title ? "green" : "red"};
                    `}
                >
                    {sortKey
                        ? (props.book as any).sortKey.substring(0, 15) + "..."
                        : ""}
                </span>
                <span
                    css={css`
                        color: blue;
                    `}
                >{` ${createdAt}`}</span>

                {/* show lastUploaded only if different */}
                {createdAt !== lastUploaded && (
                    <span
                        css={css`
                            color: green;
                        `}
                    >{` upd=${lastUploaded}`}</span>
                )}
            </div>
            {props.book.score && (
                <div>
                    <span
                        css={css`
                            color: orange;
                        `}
                    >{` ${props.book.score}`}</span>
                </div>
            )}
        </div>
    );
};
