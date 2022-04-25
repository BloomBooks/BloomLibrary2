// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
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

    // only show the key if it has, for example, a preceding number or whatever
    // At the moment, we don't have any plans to actually use the sort option that ignores numbers,
    // so I'm commenting this out to keep things more simple, visually.

    const sortKey = (props.book as any).sortKey || "";

    return (
        <div
            css={css`
                font-size: 7pt;
            `}
        >
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

            {/* show the createAt only if different */}
            {createdAt !== lastUploaded && (
                <span
                    css={css`
                        color: green;
                    `}
                >{` lu=${lastUploaded}`}</span>
            )}
        </div>
    );
};
