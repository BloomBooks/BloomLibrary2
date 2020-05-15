import css from "@emotion/css/macro";
import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useContentful } from "react-contentful";
export const ContentfulBanner: React.FunctionComponent<{
    id: string;
}> = (props) => {
    const { data, error, fetched, loading } = useContentful({
        contentType: "pageBanner",
        id: `${props.id}`,
        // default for "include' is "1", and with the current model, we only need to go 1 deep (to get the background image url)
        // include: 1
    });
    if (loading || !fetched) {
        return null;
    }

    if (error) {
        console.error(error);
        return (
            <p>
                Error ${error} looking for banner id = ${props.id}.
            </p>
        );
    }

    if (!data) {
        return <p>Could not retrieve the banner id ${props.id}.</p>;
    }

    // const { backgroundImageData, backgroundImageError, backgroundImageFetched, backgroundImageLoading } = useContentful({
    //     contentType: "asset",
    //     query: {
    //         sys: { type: "pageBanner", id: `${props.id}` },
    //     },
    // })
    //    const banner = (data as any).items[0].fields;
    const banner = (data as any).fields;
    //const titleLines = banner.Name;
    // const secondTitleLine =
    //     titleLines.length > 1 ? <div> {titleLines[1]}</div> : "";
    return (
        <div
            css={css`
                height: 300px;
                display: flex;
                flex-direction: column;
                a {
                    color:white;
                    text-decoration: underline;
                    &:visited{color:white}

                }
                /* https://www.nngroup.com/articles/text-over-images/ */
                /* #contrast-overlay {
                    background-color: rgba(0, 0, 0, 0.4);
                } */
                background-size: cover;
                * {
                    //color: white;
                }
                background-image:url(${banner.bannerImage?.fields?.file?.url})
                // this can override any of the above
                //${banner.css}
            `}
        >
            <div
                css={css`
                    margin-left: 20px;
                    flex-grow: 2;
                    display: flex;
                    flex-direction: column;
                    color: white;
                `}
            >
                <h1
                    css={css`
                        font-size: 36px;
                        margin-top: 15px;
                        /*flex-grow: 1; // push the rest to the bottom*/
                    `}
                >
                    {banner.name}
                    {/* {titleLines[0]}
                        //{secondTitleLine} */}
                </h1>

                <div
                    css={css`
                        font-weight: normal;
                        max-width: 600px;
                        margin-bottom: 10px;
                    `}
                >
                    {documentToReactComponents(banner.blurb)}
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
                    {/* <BookCount
                            message={props.bookCountMessage}
                            filter={props.filter}
                        /> */}
                    {/* just a placeholder to push the imagecredits to the right
                     */}
                    <div></div>
                    {/* there should always be imageCredits, but they may not
                        have arrived yet */}
                    {banner.imageCredits && (
                        <ImageCreditsTooltip
                            imageCredits={banner.imageCredits}
                        />
                    )}
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
