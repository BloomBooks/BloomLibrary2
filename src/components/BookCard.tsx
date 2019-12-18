import React, { useContext } from "react";
import { css } from "emotion";
import { CheapCard } from "./CheapCard";
import LazyLoad from "react-lazyload";
import { RouterContext } from "../Router";

const BookCardWidth = 120;

interface IProps {
    title: string;
    baseUrl: string;
    id: string;
    className?: string;
    lazy: boolean;
}
export const BookCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);

    const card = (
        <CheapCard
            className={
                props.className +
                " " +
                css`
                    width: ${BookCardWidth}px;
                `
            }
            key={props.baseUrl}
            onClick={() => router!.pushBook(props.id)}
        >
            {/* For (39a) Lara the Yellow Ladybird I placed a file named "test-cover" in the bucket
        in order to play with how the cards can look once we have access to their actual cover images. */}
            <img
                className={
                    "swiper-lazy " +
                    css`
                        height: 100px;
                        object-fit: cover; //cover will crop, but fill up nicely
                    `
                }
                alt={"book thumbnail"}
                // TODO: really this src shouldn't be needed because we are telling the swiper to be lazy,
                // so it should use the data-src attribute. But at the moment that leaves us with just broken images.
                src={props.baseUrl + "thumbnail-256.png"}
                data-src={props.baseUrl + "thumbnail-256.png"} // we would have to generate new thumbnails that just have the image shown on the cover
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
            <h2
                className={css`
                    font-weight: normal;
                    padding-left: 10px;
                    max-height: 40px;
                    overflow-y: hidden;
                `}
            >
                {props.title}
            </h2>
        </CheapCard>
    );

    return props.lazy ? <LazyLoad>{card}</LazyLoad> : card;
};
