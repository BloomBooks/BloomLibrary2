// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import LazyLoad from "react-lazyload";
import { RouterContext } from "../Router";
import { IBasicBookInfo, ILangPointer } from "../connection/LibraryQueryHooks";

const BookCardWidth = 140;

interface IProps {
    oneBookResult: IBasicBookInfo;
    className?: string;
    lazy: boolean;
}
export const BookCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    const card = (
        <CheapCard
            className={props.className}
            css={css`
                width: ${BookCardWidth}px;
            `}
            key={props.oneBookResult.baseUrl}
            onClick={() => router!.pushBook(props.oneBookResult.objectId)}
        >
            {/* For (39a) Lara the Yellow Ladybird I placed a file named "test-cover" in the bucket
        in order to play with how the cards can look once we have access to their actual cover images. */}
            <img
                className={"swiper-lazy"}
                css={css`
                    height: 100px;
                    object-fit: cover; //cover will crop, but fill up nicely
                `}
                alt={"book thumbnail"}
                // TODO: really this src shouldn't be needed because we are telling the swiper to be lazy,
                // so it should use the data-src attribute. But at the moment that leaves us with just broken images.
                src={props.oneBookResult.baseUrl + "thumbnail-256.png"}
                data-src={props.oneBookResult.baseUrl + "thumbnail-256.png"} // we would have to generate new thumbnails that just have the image shown on the cover
                // onError={ev => {
                //     if (props.baseUrl) {
                //         (ev.target as any).src =
                //             props.baseUrl + "thumbnail-256.png";
                //     } else {
                //         console.log("what");
                //     }
                // }}
            />
            {/* I think it would look better to have a calm, light grey Bloom logo, or a book outline, or something, instead of this animated
            LOOK AT ME! spinner. */}
            {/* <div
            className={
                "swiper-lazy-preloader " +
                css`
                    margin-top: -50px;
                `
            }
        /> */}
            <div
                css={css`
                    font-weight: normal;
                    padding-left: 3px;
                    max-height: 40px;
                    overflow-y: hidden;
                    margin-top: 3px;
                    margin-bottom: 0;
                    font-size: 10pt;
                `}
            >
                {props.oneBookResult.title}
            </div>
            <div
                css={css`
                    color: gray;
                    font-size: 9pt;
                    margin-top: auto;
                    padding: 3px;
                    overflow: hidden;
                    white-space: nowrap;
                    /* showed the total number of languages
                        text-overflow: ${"' (" +
                            props.oneBookResult.langPointers.length.toString() +
                            ")'"}; */
                        text-overflow:"..."
                `}
            >
                {props.oneBookResult.langPointers &&
                    Array.from(
                        // This `from()` and `Set()` removes duplicates, which
                        new Set( // we get if there are multiple scripts for the same language in the book
                            props.oneBookResult.langPointers.map(
                                (l: ILangPointer) => {
                                    // For languages where the name differs in English, we are currently
                                    // showing the English followed by the autonym in parentheses.
                                    const primaryName = l.englishName
                                        ? l.englishName
                                        : l.name;
                                    // Intentionally not making these a link, for now
                                    return `${primaryName}${
                                        primaryName !== l.name
                                            ? " (" + l.name + ")"
                                            : ""
                                    }`;
                                }
                            )
                        )
                    ).join(", ")}
            </div>
        </CheapCard>
    );
    /* Note, LazyLoad currently breaks strict mode. See app.tsx */
    return props.lazy ? <LazyLoad>{card}</LazyLoad> : card;
};
