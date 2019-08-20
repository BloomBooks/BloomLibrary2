import React, { Component, useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { IFilter } from "../IFilter";
import { useSearchBooks } from "./LibraryQueryHooks";
import LazyLoad from "react-lazyload";
import ReactIdSwiper, { ReactIdSwiperProps } from "react-id-swiper";
interface IProps {
    title: string;
    filter: IFilter; // becomes the "where" clause the query
    order?: string;
}
export const BookGroup: React.FunctionComponent<IProps> = props => (
    // Enhance, this has parameters, height and offset, that should help
    // but so far I haven't got them to work well. It has many other
    // parameters too that someone should look into. Make sure to test
    // with the phone sizes in the browser debugger, and have the network
    // tab open, set to "XHR". That will show you when a new query happens
    // because this has loaded a new BookGroupInner.
    // If the params are good, this list will grow as you scroll.
    // If the params are bad, some groups at the end will NEVER show.
    <LazyLoad>
        <BookGroupInner {...props} />
    </LazyLoad>
);
export const BookGroupInner: React.FunctionComponent<IProps> = props => {
    const [swiper, updateSwiper] = useState<any | null>(null);
    const search = useSearchBooks(
        {
            include: "langPointers",
            keys: "title,baseUrl",
            limit: 20,
            order: props.order || "title"
        },
        props.filter
    );

    //const countString = getCountString(queryCount);

    const zeroBooksMatchedElement =
        search.results && search.results.length > 0 ? null : (
            // <p>{`No Books for "${
            //     props.title
            // }". Should not see this in production`}</p>
            <></>
        );

    const swiperConfig = {
        preloadImages: false,
        lazy: true,
        watchSlidesVisibility: true,
        navigation: {
            nextEl: ".swiper-button-next.swiper-button-black",
            prevEl: ".swiper-button-prev"
        },
        spaceBetween: 20,
        slidesPerView: "auto"
    };
    const slideChanged = () => {
        // ENHANCE: This is where we need to trigger loading more books if they are getting towards the end
        console.log("current slide: " + swiper!.realIndex);
    };
    useEffect(() => {
        if (swiper !== null) {
            swiper.on("slideChange", slideChanged);
        }
    }, [swiper]);

    return (
        //noResultsElement ||
        zeroBooksMatchedElement || (
            <li
                className={css`
                    margin-top: 30px;
                    height: 200px; // want height to be same even if no results yet
                `}
            >
                <h1>
                    {props.title}
                    <span
                        className={css`
                            font-size: 9pt;
                            color: gray;
                            margin-left: 1em;
                        `}
                    >
                        {search.totalMatchingRecords}
                    </span>
                </h1>
                {search.waiting || (
                    <ReactIdSwiper {...swiperConfig} getSwiper={updateSwiper}>
                        {search.results.map((b: any) => (
                            <BookCard
                                key={b.baseUrl}
                                title={b.title}
                                baseUrl={b.baseUrl}
                            />
                        ))}
                    </ReactIdSwiper>
                )}
            </li>
        )
    );
};
