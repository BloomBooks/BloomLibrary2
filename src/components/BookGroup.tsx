import React, { Component, useEffect } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { IFilter } from "../IFilter";
import { useSearchBooks } from "./LibraryQueryHooks";
import LazyLoad from "react-lazyload";
import ReactIdSwiper from "react-id-swiper";
interface IProps {
    title: string;
    filter: IFilter; // becomes the "where" clause the query
    order?: string;
}

export const BookGroup: React.FunctionComponent<IProps> = props => {
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
    const params = {
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        spaceBetween: 20,
        slidesPerView: "auto"
    };

    return (
        //noResultsElement ||
        zeroBooksMatchedElement || (
            <LazyLoad height={200}>
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
                    <ReactIdSwiper {...params}>
                        {search.results.map((b: any) => (
                            <BookCard
                                key={b.baseUrl}
                                title={b.title}
                                baseUrl={b.baseUrl}
                            />
                        ))}
                    </ReactIdSwiper>
                </li>
            </LazyLoad>
        )
    );
};
