/* -----------------------

This class is deprecated. We should be merging it into BookCardGroup.

----------------------- */

import { css } from "@emotion/react";

import React, { useEffect, useState } from "react";
import LazyLoad, {
    forceCheck as forceCheckLazyLoadComponents,
} from "react-lazyload";

import { IFilter } from "FilterTypes";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookCard, useBookCardSpec } from "./BookCard";
import { useResponsiveChoice } from "../responsiveUtilities";
import { BookOrderingScheme } from "../model/ContentInterfaces";
import { CardSwiperCodeSplit } from "./CardSwiperCodeSplit";

interface IProps {
    title: string;
    order?: string;
    // I don't know... this could be "bookLimit" instead "rows". Have to think in terms
    // of mobile versus big screen.... hmmm...
    // Warning: if rows is 1 or unspecified, BookGroup shows a swiper row; this does not seem to be
    // working well at least in our stories, but it is not used in the real website as of Sep 2022.
    rows?: number;

    contextLangTag?: string;

    // Either we should have this filter:
    filter?: IFilter; // becomes the "where" clause the query
    // After the query returns a set of books, you can run a code filter
    // to further reduce the list books in this group.
    secondaryFilter?: (book: IBasicBookInfo) => boolean;
    // ..or we should have a list of predeterminedBooks that the client already chose
    predeterminedBooks?: IBasicBookInfo[];
}

export function useGetResponsiveBookGroupTopMargin(): number {
    const getResponsiveChoice = useResponsiveChoice();
    return getResponsiveChoice(3, 20) as number;
}

// BookGroup is only used by ByLanguageGroup (enhance: why?). BookCardGroup is used everywhere else. They both show <BookCard>s.
export const BookGroup: React.FunctionComponent<IProps> = (props) => {
    const documentWidth =
        document.documentElement.clientWidth ||
        document.body.clientWidth ||
        window.innerWidth;
    const cardSpec = useBookCardSpec();
    // Enhance: figure out how to get a more accurate value for availableWidth, both by a
    // better element width than documentWidth provides for the BookGroup element and by a
    // better value of the padding applied to the element.
    const availableWidth = documentWidth - cardSpec.cardSpacingPx; // approximate accounting for padding
    // An approximate (but fairly accurate) cards per row measurement is needed to prevent overly
    // lazy behavior in some cases.  See https://issues.bloomlibrary.org/youtrack/issue/BL-10676.
    const cardsPerRow = Math.max(
        1, // ensure cardsPerRow doesn't end up as 0, with a divide by zero crash below!
        Math.floor(
            availableWidth / (cardSpec.cardWidthPx + cardSpec.cardSpacingPx)
        )
    );

    // typically props.rows, if large, is intended as a maximum; very often the real size is
    // much less. We get less gigantic scroll bar ranges by limiting it.
    let rowCount = Math.min(props.rows ?? 1, 5);
    if (props.predeterminedBooks && props.rows !== 1) {
        rowCount = Math.ceil(props.predeterminedBooks.length / cardsPerRow); // still rough, but better than just using the max.
    }

    // note, if the number of cards is too small to fill up those rows, this will expect
    // to be taller than it is, but then when it is replaced by the actual content, the
    // scrollbar will adjust, so no big deal?
    const rowHeight =
        rowCount * cardSpec.cardHeightPx + useGetResponsiveBookGroupTopMargin();

    // Enhance: this has parameters, height and offset, that should help
    // but so far I haven't got them to work well. It has many other
    // parameters too that someone should look into. Make sure to test
    // with the phone sizes in the browser debugger, and have the network
    // tab open, set to "XHR". That will show you when a new query happens
    // because this has loaded a new BookGroupInner.
    // If the params are good, this list will grow as you scroll.
    // If the params are bad, some groups at the end will NEVER show.

    /* Note, this currently breaks strict mode. See app.tsx */
    return (
        <LazyLoad
            height={rowHeight}
            placeholder={
                <li
                    className="placeholder"
                    style={{ height: `${rowHeight}px` }}
                ></li>
            }
        >
            <BookGroupInner {...props} />
        </LazyLoad>
    );
};
export const BookGroupInner: React.FunctionComponent<IProps> = (props) => {
    // we have either a horizontally-scrolling list of 20, or several rows
    // of 5 each
    const maxCardsToRetrieve = props.rows ? props.rows * 5 : 20;
    const search = useSearchBooks(
        {
            include: "langPointers",
            // the following is arbitrary. I don't even yet no what the ux is that we want.
            limit: maxCardsToRetrieve,
            order: props.order,
        },
        props.filter || { language: "not going to find me" }, /// REVIEW: what happens when this is intentionally undefined
        BookOrderingScheme.NewestCreationsFirst,
        props.contextLangTag,
        !!props.predeterminedBooks // skip this if we already have books
    );

    const ready = !!props.predeterminedBooks || search?.waiting === false;

    // We make life hard on <Lazy> components by thinking maybe we'll show, for example, a row of Level 1 books at
    // the top of the screen. So the <Lazy> thing may think "well, no room for me then until they scroll". But
    // then it turns out that we don't have any level 1 books, so we don't even have a scroll bar. But too late, the
    // <Lazy> row at the bottom has already decided it should not display.
    // So here as soon as we find out how many books we have, we cause *all* <Lazy's> on the page to re-evaluate.
    // NB: this is also done, on a timing basis, by BrowseView. Doing it here as well is a controversial addition,
    // as it adds complexity and we don't know how expensive it is to do the check. But it might mean a bit faster
    // display of the row at the bottom.
    const [didReceiveResult, setDidReceiveResult] = useState(false);
    let books = props.predeterminedBooks || search.books;
    useEffect(() => {
        if (!didReceiveResult && ready) {
            if (books.length === 0) {
                // We aren't going to show this row now, so other rows may have incorrectly determined
                // that they should not load yet. But since we aren't going to show, they may be on
                // screen after all.
                forceCheckLazyLoadComponents();
            }
            setDidReceiveResult(true);
        }
    }, [didReceiveResult, ready, books.length]);

    const showInOneRow = !props.rows || props.rows < 2;
    if (props.secondaryFilter) {
        books = books.filter((b) => props.secondaryFilter!(b));
    }
    const cards = books.map((b: IBasicBookInfo) => (
        // if we're showing in one row, then we'll let swiper handle the laziness, otherwise
        // we tell the card to try and be lazy itself.
        // Note: I don't think any current clients use the showInOneRow version of BookGroup,
        // and I'm not sure it will work with the latest swiper.
        <BookCard
            laziness={showInOneRow ? "swiper" : "self"}
            key={b.baseUrl}
            basicBookInfo={b}
            contextLangTag={props.contextLangTag}
        />
    ));

    // Enhance: allow using a MoreCard even with a fixed set of known books, rather than only if we're using a filter.
    // BookGroups, especially those that need MoreCards, are being progressively replaced
    // with CollectionGroups.
    // if (props.filter && search.totalMatchingRecords > maxCardsToRetrieve) {
    //     cards.push(
    //         <MoreCard
    //             key={"more"}
    //             title={props.title}
    //             filter={props.filter}
    //             count={search.totalMatchingRecords}
    //             rows={props.rows ? props.rows * 2 : 2}
    //         />
    //     );
    // }

    // JT Sep 2022: showInOneRow is true only when BookGroup is either told to show exactly one row, or
    // not told how many rows to show. Currently this happens only in the various stories which were written
    // early on to test it; the only real use of BookGroup is in ByLanguageGroups, which passes 999.
    // When I tried the stories in Sep 2022, they were working very badly: showing a set of cards
    // with no spacing. I wanted to retire the obsolete SingleRowCardSwiper, so I switched this rather crudely
    // to use our current CardSwiperLazy. This looks a bit better but the book cards are not getting their
    // images. Since this currently only shows up in test stories that we don't seem to be using, I decided
    // not to try to fix it.
    const cardSpec = useBookCardSpec();
    const bookList = showInOneRow ? (
        <CardSwiperCodeSplit
            data={cards}
            getReactElement={(x) => x}
            wrapperRole="list"
            cardSpec={cardSpec}
        >
            {cards}
        </CardSwiperCodeSplit>
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
        (props.predeterminedBooks && props.predeterminedBooks.length > 0) ||
        (search.books && search.books.length > 0) ? null : (
            // <p>{`No Books for "${
            //     props.title
            // }". Should not see this in production`}</p>
            <React.Fragment></React.Fragment>
        );

    const topMarginPx = useGetResponsiveBookGroupTopMargin();
    const minHeightPx = useBookCardSpec().cardHeightPx + topMarginPx;
    return (
        //We just don't show the row if there are no matches, e.g., no Health books for this project
        // (ZeroBooksMatchedElement will be an empty pseudo-element that satisfies the 'or' but shows nothing)
        zeroBooksMatchedElement || (
            <li
                css={css`
                    margin-top: ${topMarginPx}px;
                    // we don't know yet how many rows we might get if rows>1, but at least leave room for one
                    min-height: ${minHeightPx}px;
                `}
                role="region"
                aria-label={props.title}
            >
                <h1>{props.title}</h1>
                {ready && bookList}
            </li>
        )
    );
};
