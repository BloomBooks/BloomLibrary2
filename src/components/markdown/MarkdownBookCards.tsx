// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";
import { BookCard, BookCardPlaceholder } from "../BookCard";
import { useGetBasicBookInfos } from "../../connection/LibraryQueryHooks";

// This allows contentful markdown to say:
// <BookCards>iaDIPe26vp 2kC3MzBcrv,tGgzjvnG5v</BookCards>
export const MarkdownBookCards: React.FunctionComponent<{}> = (props) => {
    const str = React.Children.toArray(props.children)[0] as string;
    const ids: string[] = str
        .split(/[ ,]+/) // comma or space
        .map((s) => s.trim())
        .filter((s) => s);

    const bookInfos = useGetBasicBookInfos(ids);
    return (
        <div
            css={css`
                display: flex;
            `}
        >
            {bookInfos ? (
                bookInfos.map((info) => (
                    <BookCard
                        key={info.objectId}
                        basicBookInfo={info}
                        laziness={"never"}
                    ></BookCard>
                ))
            ) : (
                <BookCardPlaceholder />
            )}
        </div>
    );
};
