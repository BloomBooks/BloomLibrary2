// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import LazyLoad, {
    forceCheck as forceCheckLazyLoadComponents,
} from "react-lazyload";

import { commonUI } from "../theme";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookCard } from "./BookCard";
import { MoreCard } from "./MoreCard";
import { CardSwiper } from "./CardSwiper";
import { ICollection } from "../model/ContentInterfaces";
import Typography from "@material-ui/core/Typography";

interface IProps {
    title?: string;
    collection: ICollection;
    //order?: string; another collection prop?
    // I don't know... this could be "bookLimit" instead "rows". Have to think in terms
    // of mobile versus big screen.... hmmm...
    rows?: number;
    skip?: number; // of items in collection (used for paging through with More)

    contextLangIso?: string;
}

export const BookCardGroup: React.FunctionComponent<IProps> = (props) => {
    const rowHeight =
        (props.rows ?? 1) * commonUI.bookCardHeightPx +
        commonUI.bookGroupTopMarginPx;
    if (!props.collection.filter) {
        // this happens for example if there are no "published" the cards in the row
        return null; // otherwise we would just get all the books in the library
    }
    return (
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
                rowHeight
            }
            // Set offset to keep one more item expanded, so keyboard shortcuts can find them
            // Set placeholder so that ul child items are of correct accessible class.
            // Note that explicit placeholders must control their own height.
            offset={rowHeight}
            placeholder={
                <li
                    className="placeholder"
                    style={{ height: `${rowHeight}px` }}
                ></li>
            }
        >
            <CollectionGroupInner {...props} />
        </LazyLoad>
    );
};
export const CollectionGroupInner: React.FunctionComponent<IProps> = (
    props
) => {
    // we have either a horizontally-scrolling list of 20, or several rows
    // of 5 each
    const maxCardsToRetrieve = props.rows ? props.rows * 5 : 20;
    const collectionFilter = props.collection.filter ?? {};

    const search = useSearchBooks(
        {
            include: "langPointers",
            // the following is arbitrary. I don't even yet no what the ux is that we want.
            limit: maxCardsToRetrieve,
            order: props.collection.order || "titleOrScore",
            skip: props.skip,
        },
        collectionFilter
    );

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
    let books = search.books;

    if (props.collection.secondaryFilter) {
        books = books.filter((b) => props.collection.secondaryFilter!(b));
    }

    const cards = books.map((b: IBasicBookInfo) => (
        // if we're showing in one row, then we'll let swiper handle the laziness, otherwise
        // we tell the card to try and be lazy itself.
        <BookCard
            handleYourOwnLaziness={!showInOneRow}
            key={b.baseUrl}
            basicBookInfo={b}
            contextLangIso={props.contextLangIso}
        />
    ));

    // our more card, if clicked, will result in skipping more than this time.
    let nextSkip: number | undefined;
    if (props.skip === undefined) {
        nextSkip = 0; // typically, displaying one row, more will display a lot starting from 0.
    } else {
        // typically, we're already showing the first props.skip cards in a More view, and want the next group if we click More.
        nextSkip = props.skip + maxCardsToRetrieve;
    }

    // Enhance: allow using a MoreCard even with a fixed set of known books, rather than only if we're using a filter.
    if (
        search.totalMatchingRecords > (props.skip ?? 0) + maxCardsToRetrieve &&
        props.collection.urlKey !== "new-arrivals"
    ) {
        cards.push(
            <MoreCard
                key="more"
                collection={props.collection}
                skip={nextSkip}
            />
        );
    }

    const bookList = showInOneRow ? (
        <CardSwiper>{cards}</CardSwiper>
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

    // This is a compromise. The problem is, search.totalMatchingRecords is not accurate,
    // because it ignores the effect of the secondary filter. So if we always show that, we can get
    // weird-looking results like a list that says it contains two results and obviously only shows one.
    // But, we can only apply the secondary filter to the books we actually retrieved.
    // So, if we retrieved all of them, we correct the number; otherwise, the best we can do is to
    // let it stand.
    let countToShow = search.totalMatchingRecords;
    if (countToShow < maxCardsToRetrieve) {
        countToShow = books.length;
    }
    const label = props.title ?? props.collection.label;

    let group;
    switch (props.collection.layout) {
        case "layout: description-followed-by-row-of-books":
            group = (
                <React.Fragment>
                    <div
                        css={css`
                            display: flex;
                            flex-direction: row;
                            // The default margin-left is "auto"
                            .swiper-container {
                                margin-left: 0;
                            }
                        `}
                    >
                        <div
                            css={css`
                                width: 200px;
                                margin-right: 20px;
                            `}
                        >
                            <h1>{label}</h1>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                component="p"
                            >
                                {props.collection.description}
                            </Typography>
                        </div>
                        {search.waiting || bookList}
                    </div>
                </React.Fragment>
            );

            break;
        default:
            group = (
                <React.Fragment>
                    <h1>
                        {label}
                        {props.collection.urlKey === "new-arrivals" || (
                            <span
                                css={css`
                                    font-size: 9pt;
                                    color: ${commonUI.colors.minContrastGray};
                                    margin-left: 1em;
                                `}
                            >
                                {countToShow}
                            </span>
                        )}
                    </h1>
                    {search.waiting || bookList}
                </React.Fragment>
            );
            break;
    }

    return (
        //We just don't show the row if there are no matches, e.g., no Health books for this project
        // (ZeroBooksMatchedElement will be an empty pseudo-element that satisfies the 'or' but shows nothing)
        zeroBooksMatchedElement || (
            <li
                css={css`
                    margin-top: ${commonUI.bookGroupTopMarginPx}px;
                    // we don't know yet how many rows we might get if rows>1, but at least leave room for one
                    min-height: ${commonUI.bookCardHeightPx +
                    commonUI.bookGroupTopMarginPx}px;
                `}
                role="region"
                aria-label={label}
            >
                {group}
            </li>
        )
    );
};
