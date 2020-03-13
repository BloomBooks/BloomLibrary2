// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { IFilter } from "../IFilter";
import {
    useSearchBooks,
    IBasicBookInfo
} from "../connection/LibraryQueryHooks";
import LazyLoad from "react-lazyload";
import ReactIdSwiper from "react-id-swiper";
import { MoreCard } from "./MoreCard";
import { commonUI } from "../theme";
import { forceCheck as forceCheckLazyLoadComponents } from "react-lazyload";
interface IProps {
    title: string;
    filter: IFilter; // becomes the "where" clause the query
    order?: string;
    // I don't know... this could be "bookLimit" instead "rows". Have to think in terms
    // of mobile versus big screen.... hmmm...
    rows?: number;
}

export const BookGroup: React.FunctionComponent<IProps> = props => (
    // Enhance: this has parameters, height and offset, that should help
    // but so far I haven't got them to work well. It has many other
    // parameters too that someone should look into. Make sure to test
    // with the phone sizes in the browser debugger, and have the network
    // tab open, set to "XHR". That will show you when a new query happens
    // because this has loaded a new BookGroupInner.
    // If the params are good, this list will grow as you scroll.
    // If the params are bad, some groups at the end will NEVER show.

    /* Note, this currently breaks strict mode. See app.tsx */
    <LazyLoad
        height={
            /* note, if the number of cards is too small to fill up those rows, this will expect
                    to be taller than it is, but then when it is replaced by the actual content, the
                    scrollbar will adjust, so no big deal?*/
            (props.rows ?? 1) * commonUI.bookCardHeightPx +
            commonUI.bookGroupTopMarginPx
        }
    >
        <BookGroupInner {...props} />
    </LazyLoad>
);
export const BookGroupInner: React.FunctionComponent<IProps> = props => {
    // we have either a horizontally-scrolling list of 20, or several rows
    // of 5 each
    const maxCardsToRetrieve = props.rows ? props.rows * 5 : 20;
    const search = useSearchBooks(
        {
            include: "langPointers",
            keys:
                "title,baseUrl,objectId,langPointers,tags,features,harvestState,harvestStartedAt",
            // the following is arbitrary. I don't even yet no what the ux is that we want.
            limit: maxCardsToRetrieve,
            order: props.order || "titleOrScore"
        },
        props.filter
    );

    const swiperConfig = {
        preloadImages: false,
        lazy: true,
        watchSlidesVisibility: true,
        navigation: {
            nextEl: ".swiper-button-next.swiper-button",
            prevEl: ".swiper-button-prev.swiper-button"
        },
        spaceBetween: 20,
        slidesPerView: "auto"
    };
 
    // We make life hard on <Lazy> components by thinking maybe we'll show, for example, a row of Level 1 books at
    // the top of the screen. So the <Lazy> thing may think "well, no room for me then until they scroll". But
    // then it turns out that we don't have any level 1 books, so we don't even have a scroll bar. But too late, the
    // <Lazy> row at the bottom has already decided it should not display.
    // So here as soon as we find out how many books we have, we cause *all* <Lazy's> on the page to re-evaluate.
    // NB: this is also done, on a timing basis, by BrowseView. Doing it here as well is a controversial addition,
    // as it adds complexity and we don't know how expensive it is to do the check. But it might mean a bit faster
    // display of the row at the bottom.
    const [didReceiveResult, setDidReceiveResult] = useState(false);
    useEffect(() => {
        if (!didReceiveResult && search?.waiting === false) {
            if (search?.books.length === 0) {
                // We aren't going to show this row now, so other rows may have incorrectly determined
                // that they should not load yet. But since we aren't going to show, they may be on
                // screen after all.
                forceCheckLazyLoadComponents();
            }
            setDidReceiveResult(true);
        }
    }, [search, didReceiveResult]);

    const showInOneRow = !props.rows || props.rows < 2;

    const cards = search.books.map((b: IBasicBookInfo) => (
        // if we're showing in one row, then we'll let swiper handle the laziness, otherwise
        // we tell the card to try and be lazy itself.
        <BookCard
            handleYourOwnLaziness={!showInOneRow}
            key={b.baseUrl}
            onBasicBookInfo={b}
        />
    ));
    if (search.totalMatchingRecords > maxCardsToRetrieve) {
        cards.push(
            <MoreCard
                key={"more"}
                title={props.title}
                filter={props.filter}
                count={search.totalMatchingRecords}
                rows={props.rows ? props.rows * 2 : 2}
            />
        );
    }
    const bookList = showInOneRow ? (
        <ReactIdSwiper {...swiperConfig}>{cards}</ReactIdSwiper>
    ) : (
        <div
            css={css`
                display: flex;
                flex-wrap: wrap;
            `}
        >
            {cards}
        </div>
    );

    const zeroBooksMatchedElement =
        search.books && search.books.length > 0 ? null : (
            // <p>{`No Books for "${
            //     props.title
            // }". Should not see this in production`}</p>
            <React.Fragment></React.Fragment>
        );

    return (
        //We just don't show the row if there are no matches, e.g., no Health books for this project
        // (ZeroBooksMatchedElement will be an empty pseudo-element that satisfies the 'or' but shows nothing)
        zeroBooksMatchedElement || (
            <li
                css={css`
                    margin-top: ${commonUI.bookGroupTopMarginPx}px;
                    height: ${commonUI.bookCardHeightPx +
                        commonUI.bookGroupTopMarginPx}px; // want height to be same even if no results yet
                `}
            >
                <h1>
                    {props.title}
                    <span
                        css={css`
                            font-size: 9pt;
                            color: gray;
                            margin-left: 1em;
                        `}
                    >
                        {search.totalMatchingRecords}
                    </span>
                </h1>
                {search.waiting || bookList}
            </li>
        )
    );
};
