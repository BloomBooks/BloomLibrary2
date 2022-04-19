// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { getBookSortKey } from "../connection/sorting";
import { BookOrderingScheme } from "../model/ContentInterfaces";

// this can be used when testing sorting to give info on sort keys and dates, so that you can see if the
// card is sorting like you expect.
export const SortInfo: React.FunctionComponent<{
    title: string;
    book: IBasicBookInfo;
}> = (props) => {
    //{sortTestingMode && props.basicBookInfo.lastUploaded?.iso && (

    const lastUploaded = props.book.lastUploaded?.iso.substring(0, 10);
    const createdAt = props.book.createdAt.substring(0, 10);
    const sortKey = getBookSortKey(
        props.title,
        BookOrderingScheme.TitleAlphaIgnoringNumbers
    );
    // only show the key if it has, for example, a preceding number or whatever
    const keyToShow = sortKey !== props.title ? sortKey : "";

    return (
        <div
            css={css`
                font-size: 6pt;
            `}
        >
            <span
                css={css`
                    color: blue;
                `}
            >
                {keyToShow}
            </span>
            <span>{`${lastUploaded}`}</span>

            {/* show the createAt only if different */}
            {createdAt !== lastUploaded && (
                <span
                    css={css`
                        color: red;
                    `}
                >{`ca=${createdAt}`}</span>
            )}
        </div>
    );
};
