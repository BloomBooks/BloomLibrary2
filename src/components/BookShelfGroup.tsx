// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import {
    useGetBookshelvesByCategory,
    IBookshelfResult
} from "../connection/LibraryQueryHooks";
import CategoryCard from "./CategoryCard";
import LazyLoad from "react-lazyload";

const encodeUrl = require("encodeurl");
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

export const BookshelfGroup: React.FunctionComponent<IProps> = props => (
    // Enhance: this has parameters, height and offset, that should help
    // but so far I haven't got them to work well. It has many other
    // parameters too that someone should look into. Make sure to test
    // with the phone sizes in the browser debugger, and have the network
    // tab open, set to "XHR". That will show you when a new query happens
    // because this has loaded a new BookGroupInner.
    // If the params are good, this list will grow as you scroll.
    // If the params are bad, some groups at the end will NEVER show.

    /* Note, this currently breaks strict mode. See app.tsx */
    <LazyLoad height={258 /* todo derive from commonui.something */}>
        <BookshelfGroupInner {...props} />
    </LazyLoad>
);

const nameToImageMap = new Map<string, string>([
    //  // something in our pipeline won't deliver an image that starts with "3"
    ["3Asafeer", "Asafeer"],
    ["Room To Read", "Room to Read"]
]);

export const BookshelfGroupInner: React.FunctionComponent<IProps> = props => {
    // At this point there are so few bookshelves that we just retrieve the whole list and then filter here.
    // Might be a good thing to cache.
    const bookshelfResults = useGetBookshelvesByCategory(
        props.bookShelfCategory
    );
    // const nameToImage = [
    //     ["Ministerio de Educación de Guatemala", "guatemala-moe-logo.svg"]
    // ];

    const parts =
        bookshelfResults &&
        bookshelfResults
            .filter(
                (shelf: IBookshelfResult) =>
                    // allow if we weren't given a bookshelf to filter by
                    !props.parentBookshelf ||
                    props.parentBookshelf.length === 0 ||
                    // currently we only allow 2 levels of bookshelf, and a child bookshelf will look like
                    // Art/Painting. So this is checking to see if "Art/Painting" starts with "Art"
                    shelf.englishName.startsWith(props.parentBookshelf)
            )
            .map((shelf: IBookshelfResult) => {
                const imageName = nameToImageMap.get(shelf.key) ?? shelf.key;
                return (
                    <CategoryCard
                        key={shelf.key}
                        title={shelf.englishName}
                        bookCount="??"
                        filter={{
                            bookshelf: shelf.key,
                            bookShelfCategory: shelf.category
                        }}
                        pageType={props.bookShelfCategory}
                        img={
                            "https://share.bloomlibrary.org/bookshelf-images/" +
                            encodeUrl(imageName) +
                            ".png"
                        }
                        bookshelfInfo={shelf}
                    />
                );
            });

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
    //                       "https://share.bloomlibrary.org/bookshelf-images/" +
    //                       l.key +
    //                       ".png"
    //                   }
    //               />
    //           ))
    //     : skeletonCards.map(c => (
    //           <CheapCard
    //               css={css`
    //                   width: 100px;

    //                   background-color: lightgray;
    //               `}
    //           />
    //       ));

    return (
        <li
            css={css`
                margin-top: 30px;
            `}
        >
            <h1>{props.title}</h1>
            <ul
                css={css`
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
