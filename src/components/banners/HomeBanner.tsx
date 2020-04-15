import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { IFilter } from "../../IFilter";
import { BannerContents } from "./Banners";
import bloomgirls from "../../assets/banners/bloomgirls.jpg";

export const HomeBanner: React.FunctionComponent<{
    filter: IFilter;
}> = (props) => {
    //const backgroundColor = "rgba(210, 227, 254,.2)";
    return (
        <div
            className={"banner"}
            css={css`
                background-image: url(${bloomgirls});
                background-position: right;
                background-size: contain;

                /* background-blend-mode: darken;
                background-color: rgba(0, 0, 0, 0.6); // fade the image to black */
            `}
        >
            <div
                css={css`
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 1) 0%,
                        rgba(255, 255, 255, 1)
                            /* position near the width of image, which is right aligned */
                            calc(100% - 507px),
                        rgba(255, 255, 255, 0.2) 100%
                    );
                `}
            >
                <BannerContents
                    title="Let's Grow a Library"
                    about={
                        // <div>
                        //     Welcome to our Crowdsourced library of free books
                        //     that you can read, print, or adapt into your own
                        //     language.
                        // </div>
                        <div
                            css={css`
                                font-size: 24pt;
                                color: red;
                            `}
                        ></div>
                    }
                    bookCountMessage="{0} books"
                    filter={props.filter} // all books in circulation
                    bannerCss={css`
                        * {
                            color: black;
                        }
                        #contrast-overlay {
                            background-color: transparent;
                        }
                    `}
                />
            </div>
        </div>
    );
};
