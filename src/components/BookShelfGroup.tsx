import React from "react";
import { css } from "emotion";
import { useGetBookshelves } from "../connection/LibraryQueryHooks";
import { getResultsOrMessageElement } from "../connection/GetQueryResultsUI";
import CategoryCard from "./CategoryCard";

interface IProps {
    title: string;
    bookShelfCategory: string; // project, org, publisher, custom
    parentBookshelf?: string;
}
/* This lets us show bookshelves. Not the books in them, but the list of shelves, themselves.
    It's not obvious that we want/need the current system with bookshelves which live in the database.
    On the one hand, we may find we need to do code work anyhow to do a good job of presenting a shelf,
    so why not just locate it in the code.

    On the other hand, we will eventually need to support user-generated shelves. We may also eventually
    need to support alternate book library sites, and those would be even more driven by database
    instead of code.

    So for the moment, I'm just leaving things as they are. We can query for all bookshelves, but the
    home page will also choose to feature Enabling writers, from code. So it's a mix of approaches
    for now.

    If parentBookShelf is supplied, it will show only bookshelves whose englishName starts with that;
    otherwise, all bookshelves in the database.
*/

export const BookshelfGroup: React.FunctionComponent<IProps> = props => {
    // At this point there are so few bookshelves that we just retrieve the whole list and then filter here.
    // Might be a good thing to cache.
    const bookshelfResult = useGetBookshelves(props.bookShelfCategory);

    const { noResultsElement, results } = getResultsOrMessageElement(
        bookshelfResult
    );
    const parts =
        noResultsElement ||
        results
            .filter(
                (shelf: any) =>
                    // allow if we weren't given a bookshelf to filter by
                    !props.parentBookshelf ||
                    props.parentBookshelf.length === 0 ||
                    // currently we only allow 2 levels of bookshelf, and a child bookshelf will look like
                    // Art/Painting. So this is checking to see if "Art/Painting" starts with "Art"
                    shelf.englishName.startsWith(props.parentBookshelf)
            )
            .map((l: any) => (
                <CategoryCard
                    key={l.key}
                    title={l.englishName}
                    bookCount="??"
                    filter={{ bookshelf: l.key }}
                    pageType={props.bookShelfCategory}
                    img={
                        "https://share.bloomlibrary.org/category-images/" +
                        l.key +
                        ".png"
                    }
                />
            ));

    // const parts = results
    //     ? results
    //           .filter(
    //               (shelf: any) =>
    //                   !props.parentBookshelf ||
    //                   props.parentBookshelf.length == 0 ||
    //                   shelf.englishName.indexOf(props.parentBookshelf) == 0
    //           )
    //           .map((l: any) => (
    //               <CategoryCard
    //                   key={l.key}
    //                   title={l.englishName}
    //                   bookCount="??"
    //                   filter={{ bookshelf: l.key }}
    //                   pageType={props.bookShelfCategory}
    //                   img={
    //                       "https://share.bloomlibrary.org/category-images/" +
    //                       l.key +
    //                       ".png"
    //                   }
    //               />
    //           ))
    //     : skeletonCards.map(c => (
    //           <CheapCard
    //               className={css`
    //                   width: 100px;

    //                   background-color: lightgray;
    //               `}
    //           />
    //       ));

    return (
        <li
            className={css`
                margin-top: 30px;
            `}
        >
            <h1>{props.title}</h1>
            <ul
                className={css`
                    list-style: none;
                    display: flex;
                    padding-left: 0;
                `}
            >
                {parts}
            </ul>
        </li>
    );
};
