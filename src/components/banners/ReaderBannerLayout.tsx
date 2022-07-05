import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { Breadcrumbs } from "../Breadcrumbs";
import { BookCount } from "../BookCount";
import { ICollection, IBanner } from "../../model/ContentInterfaces";
import { BannerTitle } from "./Blurb";

export const readerPadding = "6px";

// This is a cut-down version of StandardBannerLayout intended for use inside BloomReader.
export const ReaderBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                overflow: hidden;
                *,
                a {
                    color: white;
                }
            `}
        >
            <div
                id="contrast-overlay"
                css={css`
                    background-color: #4180bb;
                    padding: 3px ${readerPadding};
                    overflow: hidden;
                `}
            >
                <Breadcrumbs
                    css={css`
                        margin: 0 !important;
                        margin-bottom: 3px !important;
                    `}
                />

                <BannerTitle
                    hideTitle={false}
                    {...props}
                    css={css`
                        margin-bottom: 0;
                    `}
                />

                {props.bookCount || <BookCount collection={props.collection} />}
            </div>
        </div>
    );
};
