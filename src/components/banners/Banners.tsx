import css from "@emotion/css/macro";
import React, { Fragment } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx, SerializedStyles } from "@emotion/core";
/** @jsx jsx */

import { BookCount } from "../BookCount";
import { Breadcrumbs } from "../Breadcrumbs";
import { IFilter } from "../../IFilter";
import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { commonUI } from "../../theme";
export interface IBannerSpec {
    key: string; // language tag, bookshelf key, etc.
    bannerCss?: SerializedStyles;
    about?: JSX.Element;
    imageCredits?: JSX.Element;
    // todo: we can't actually use this until we hoist the lookup
    // of the language info from the banner up to the page
    pageBackground?: string;
    titleOverride?: string;
}
export const BannerContents: React.FunctionComponent<{
    title: string;
    bookCountMessage: string;
    filter: IFilter;
    about?: JSX.Element;
    imageCredits?: JSX.Element;
    bannerCss?: SerializedStyles;
}> = (props) => {
    const titleLines = props.title.split("/");
    console.assert(
        titleLines.length < 3,
        "display code only supports one '/' in the title"
    );
    const secondTitleLine =
        titleLines.length > 1 ? <div> {titleLines[1]}</div> : "";
    return (
        <div
            css={css`
                //height: 100%;
                display: flex;
                flex-direction: column;
                a {
                    text-decoration: underline;
                }
                /* https://www.nngroup.com/articles/text-over-images/ */
                #contrast-overlay {
                    background-color: rgba(0, 0, 0, 0.4);
                }
                background-size: cover;
                * {
                    color: white;
                }
                // this can override any of the above
                ${props.bannerCss}
            `}
        >
            <div id="contrast-overlay">
                <div
                    css={css`
                        margin-left: 20px;
                        flex-grow: 2;
                        display: flex;
                        flex-direction: column;
                    `}
                >
                    <Breadcrumbs />
                    <h1
                        css={css`
                            font-size: ${titleLines.length > 1 ? 36 : 72}px;
                            margin-top: 0;
                            //flex-grow: 1; // push the rest to the bottom
                        `}
                    >
                        {titleLines[0]}
                        {secondTitleLine}
                    </h1>

                    <div
                        css={css`
                            font-weight: normal;
                            max-width: 600px;
                            margin-bottom: 10px;
                        `}
                    >
                        {/* If there is "about" text, show that. Otherwise show a wikipedia link about the language. */}
                        {props.about ||
                            (props.filter.language && (
                                <Fragment>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://en.wikipedia.org/w/index.php?title=ISO_639:${props.filter.language}&redirect=yes`}
                                    >
                                        Wikipedia
                                    </a>
                                </Fragment>
                            ))}
                    </div>
                    <div
                        css={css`
                            margin-top: auto;
                            margin-bottom: 5px;
                            display: flex;
                            justify-content: space-between;
                            width: 100%;
                        `}
                    >
                        <BookCount
                            message={props.bookCountMessage}
                            filter={props.filter}
                        />
                        {/* there should always be imageCredits, but they may not
                        have arrived yet */}
                        {props.imageCredits && (
                            <ImageCreditsTooltip
                                imageCredits={props.imageCredits}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// export const SearchBanner: React.FunctionComponent<{
//     filter: IFilter;
// }> = props => {
//     return (
//         <div
//             css={css`
//                 background-color: ${commonUI.colors.bloomRed};
//                 color: whitesmoke;
//                 padding-bottom: 10px;
//                 padding-left: 20px;
//             `}
//         >
//             <Breadcrumbs />
//             <BookCount filter={props.filter} />
//         </div>
//     );
// };
