import { css } from "@emotion/react";

import React, { Fragment, useEffect, useState } from "react";
import LazyLoad, {
    forceCheck as forceCheckLazyLoadComponents,
} from "react-lazyload";

import { commonUI } from "../theme";
import { useResponsiveChoice, useSmallScreen } from "../responsiveUtilities";
import {
    useSearchBooks,
    IBasicBookInfo,
} from "../connection/LibraryQueryHooks";
import { BookCard, useBookCardSpec } from "./BookCard";
import { MoreCard } from "./MoreCard";
import { CardSwiperCodeSplit } from "./CardSwiperCodeSplit";
import { ICollection } from "../model/ContentInterfaces";
import Typography from "@material-ui/core/Typography";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { useGetResponsiveBookGroupTopMargin } from "./BookGroup";
import { BlorgMarkdown } from "./markdown/BlorgMarkdown";
import { AllCard } from "./AllCard";
import { CollectionLayout } from "./CollectionLayout";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { CollectionInfoWidget } from "./CollectionInfoWidget";
import { getFilterDuplicateBookFilterFromName } from "../model/DuplicateBookFilter";
import { InfoIconWithTooltip } from "./InfoIconWithTooltip";
import { useShowTroubleshootingStuff } from "../Utilities";

interface IProps {
    title?: string;
    collection: ICollection;
    //order?: string; another collection prop?
    // I don't know... this could be "bookLimit" instead "rows". Have to think in terms
    // of mobile versus big screen.... hmmm...
    rows?: number;
    skip?: number; // of items in collection (used for paging through with More)

    useCollectionLayoutSettingForBookCards?: boolean;

    hideHeaderAndCount?: boolean;
}

export const BookCardGroup: React.FunctionComponent<IProps> = (props) => {
    const cardSpec = useBookCardSpec();
    const rowHeight =
        (props.rows ?? 1) * cardSpec.cardHeightPx +
        useGetResponsiveBookGroupTopMargin();
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
            <BookCardGroupInner {...props} />
        </LazyLoad>
    );
};
const BookCardGroupInner: React.FunctionComponent<IProps> = (props) => {
    const [showTroubleshootingStuff] = useShowTroubleshootingStuff();

    // we have either a horizontally-scrolling list of 20, or several rows
    // of 5 each
    const maxCardsToRetrieve = props.rows ? props.rows * 5 : 20;
    const collectionFilter = props.collection.filter ?? {};
    const getResponsiveChoice = useResponsiveChoice();
    const cardSpec = useBookCardSpec();
    const isSmall = useSmallScreen();
    const search = useSearchBooks(
        {
            include: "langPointers",
            // the following is arbitrary. I don't even yet no what the ux is that we want.
            limit: maxCardsToRetrieve, // note that if the selected BookOrderingScheme requires client-side sorting, this will be ignored
            skip: props.skip,
        },
        collectionFilter,
        props.collection.orderingScheme,
        props.collection.contextLangTag
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

    const bookCountAfterSecondaryFilter = books.length;
    if (
        props.collection.duplicateBookFilterName &&
        // conceivably we could get this to work without context languages, but we're running into a million "cat & dog"s with the same hash.
        // without a language, we'd need a new way to distinguish them.
        props.collection.contextLangTag
    ) {
        const fn = getFilterDuplicateBookFilterFromName(
            props.collection.duplicateBookFilterName
        );
        books = fn(
            books,
            props.collection.contextLangTag,
            showTroubleshootingStuff
        );
    }
    const bookCountAfterDuplicateRemoval = books.length;

    // This is a compromise. The problem is, search.totalMatchingRecords is not accurate,
    // because it ignores the effect of the secondary filter. So if we always show that, we can get
    // weird-looking results like a list that says it contains two results and obviously only shows one.
    // But, we can only apply the secondary filter & duplication filter to the books we actually retrieved.
    // So, if we retrieved all of them, we correct the number; otherwise, we avoid confusion by showing no
    // count rather than guessing at what the total might be.
    let countToShow: number | undefined = undefined;
    if (search.totalMatchingRecords < maxCardsToRetrieve) {
        countToShow = books.length;
    }

    // As of 11/2021, this skip stuff is not really being used. In theory it would all still work if
    // anything initiated the skipping. But our more cards now just loads the whole (filtered) collection.
    // Below here, comments in this little code section reflect the original intention/state of the skipping logic.
    // Our more card, if clicked, will result in skipping more than this time.
    let nextSkip: number | undefined;
    if (props.skip === undefined) {
        nextSkip = 0; // typically, displaying one row, more will display a lot starting from 0.
    } else {
        // typically, we're already showing the first props.skip cards in a More view, and want the next group if we click More.
        nextSkip = props.skip + maxCardsToRetrieve;
    }

    const wantMoreOrAllCard =
        search.totalMatchingRecords > (props.skip ?? 0) + maxCardsToRetrieve;

    let bookList: React.ReactElement | undefined;

    if (showInOneRow) {
        const data: (IBasicBookInfo | "more")[] = [...books];
        if (wantMoreOrAllCard) {
            data.push("more");
        }
        bookList = (
            <CardSwiperCodeSplit
                data={data}
                cardSpec={cardSpec}
                getReactElement={(item: IBasicBookInfo | "more", index) => {
                    if (item === "more") {
                        return (
                            <MoreCard
                                key="more"
                                collection={props.collection}
                                skip={nextSkip}
                            />
                        );
                    } else {
                        return (
                            <BookCard
                                laziness="never"
                                key={item.baseUrl}
                                basicBookInfo={item}
                                contextLangTag={props.collection.contextLangTag}
                            />
                        );
                    }
                }}
            ></CardSwiperCodeSplit>
        );
    } else {
        const verticalSpacing = cardSpec.cardSpacingPx;
        const cards = books.map((b: IBasicBookInfo) => (
            // if we're showing in one row, then we'll let swiper handle the laziness, otherwise
            // we tell the card to try and be lazy itself.
            <BookCard
                laziness="self"
                key={b.baseUrl}
                basicBookInfo={b}
                contextLangTag={props.collection.contextLangTag}
                css={css`
                    margin-bottom: ${verticalSpacing}px;
                `}
            />
        ));

        if (wantMoreOrAllCard && props.collection.urlKey !== "new-arrivals") {
            // The AllCard on new arrivals would display all books (well, up to the current 5000 max),
            // but we decided we don't want to do that.
            cards.push(
                <AllCard
                    key="all"
                    collection={props.collection}
                    css={css`
                        margin-bottom: ${verticalSpacing}px;
                    `}
                />
            );
        }

        bookList = (
            <div
                css={css`
                    display: flex;
                    flex-wrap: wrap;
                    // Negative bottom margin on the container couteracts the the bottom margin on the elements
                    // so the last row doesn't have extraneous margin at the end.
                    margin-bottom: -${verticalSpacing}px;
                `}
            >
                {cards}
            </div>
        );
    }

    const zeroBooksMatchedElement =
        search.books && search.books.length > 0 ? null : (
            // <p>{`No Books for "${
            //     props.title
            // }". Should not see this in production`}</p>
            <React.Fragment></React.Fragment>
        );

    // props.title, if provided, is already localized
    const label = props.title ?? getLocalizedCollectionLabel(props.collection);

    const descriptionBlockLargeWidth = 200;
    const descriptionBlockLargeRightMargin = 20;

    // On a small screen, the description is above the books, so it should be full width.
    //  (It won't get too long because then it is a large screen...)
    // On a large screen, the description is to the left of the books, so it should be a fixed width.
    const descriptionBlockWidth = getResponsiveChoice(
        "unset",
        `${descriptionBlockLargeWidth}px`
    );

    const descriptionBlock = (
        <div
            css={css`
                // I don't know why width was being ignored, so here it's more locked down
                width: ${descriptionBlockWidth};
                min-width: ${descriptionBlockWidth};
                max-width: ${descriptionBlockWidth};

                margin-right: ${getResponsiveChoice(
                    10,
                    descriptionBlockLargeRightMargin
                )}px;
                margin-bottom: 10px; // for mobile where this is on top

                // See below: we use absolute positioning when arranged in a row to work around a Swiper bug.
                position: ${getResponsiveChoice("relative", "absolute")};

                // These rules (max-height, overflow-y, flex) are to make the description text (but not header) scrollable.
                max-height: ${getResponsiveChoice(
                    "unset",
                    "100%"
                )}; // Constrain description height to row height when on left.
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            `}
        >
            <h1
                css={css`
                    ${getResponsiveChoice("", "margin-top: 0")}
                `}
            >
                {label}
            </h1>
            <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                // We want the description text to scroll but not the header. (Applies to large screen only.)
                css={css`
                    flex-grow: 1;
                    overflow-y: auto;
                `}
            >
                <BlorgMarkdown markdown={props.collection.description} />
            </Typography>
            <CollectionInfoWidget collection={props.collection} />
        </div>
    );

    const showCondensedBookCountNotice =
        props.collection.duplicateBookFilterName &&
        bookCountAfterDuplicateRemoval < bookCountAfterSecondaryFilter;
    const responsiveHeaderAndCount = (
        <h1
            css={css`
                font-size: ${getResponsiveChoice(10, 14)}pt;
            `}
        >
            {label}
            {props.collection.urlKey === "new-arrivals" || (
                <span
                    css={css`
                        font-size: 9pt;
                        color: ${commonUI.colors.minContrastGray};
                        margin-left: 1em;
                    `}
                >
                    <Fragment>
                        {countToShow}{" "}
                        {countToShow && showCondensedBookCountNotice && (
                            <InfoIconWithTooltip>
                                {`We condensed this list down from from ${bookCountAfterSecondaryFilter} books using "${props.collection.duplicateBookFilterName}".`}
                            </InfoIconWithTooltip>
                        )}
                    </Fragment>
                </span>
            )}
            <CollectionInfoWidget collection={props.collection} />
        </h1>
    );

    let group;
    // this is used on the "Resources" screen
    if (
        props.collection.layout ===
        "layout: description-followed-by-row-of-books"
    ) {
        group = (
            <React.Fragment>
                <div
                    css={css`
                        position: relative;
                    `}
                >
                    {isSmall ? (
                        <React.Fragment>
                            {descriptionBlock}
                            {search.waiting || bookList}
                        </React.Fragment>
                    ) : (
                        // Would much prefer to use a div with display:flex here, or just make the containing
                        // div display:flex with a conditional direction. But Swiper behaves weirdly if its
                        // parent is a horizontal flexbox, especially if everything fits. The last card is not
                        // created properly (gets rendered with visible:false) and the Next button is shown
                        // even though everything fits. There may be a better workaround, but so far this is
                        // the best I can find: the old-fashioned approach, where we make a row
                        // by positioning one child absolutely and padding the other to leave room for it.
                        <React.Fragment>
                            {descriptionBlock}
                            <div
                                css={css`
                                    padding-left: ${descriptionBlockLargeWidth +
                                    descriptionBlockLargeRightMargin}px;
                                `}
                            >
                                {search.waiting || bookList}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>
        );
    } else {
        group = (
            <React.Fragment>
                {props.hideHeaderAndCount || responsiveHeaderAndCount}
                {search.waiting ||
                    (props.useCollectionLayoutSettingForBookCards &&
                    // If contentful didn't set a layout, we don't want to use the normal default in CollectionLayout.
                    // Instead just use our bookList. See comment below.
                    props.collection.rawLayout ? (
                        props.collection.rawLayout === "all-books" ? (
                            <CollectionLayout
                                collection={props.collection}
                                hideHeaderAndCount={true} // we've already shown the header and count for this collection
                            />
                        ) : (
                            <ListOfBookGroups>
                                <CollectionLayout
                                    collection={props.collection}
                                />
                            </ListOfBookGroups>
                        )
                    ) : (
                        // ENHANCE:
                        // In theory, we could move the logic which creates bookList (above) into CollectionLayout
                        // since these simple book lists are "layouts" we might want to reuse elsewhere.
                        // But we are also considering totally revamping how layouts are defined in various contexts,
                        // so it isn't worth the refactoring at the moment.
                        bookList
                    ))}
            </React.Fragment>
        );
    }

    const topMarginPx = useGetResponsiveBookGroupTopMargin();
    const minHeightPx = cardSpec.cardHeightPx + topMarginPx;
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
                aria-label={label}
            >
                {group}
            </li>
        )
    );
};
