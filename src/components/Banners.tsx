import React from "react";
import { css, cx } from "emotion";
import { BookCount } from "./BookCount";
import { Breadcrumbs } from "./Breadcrumbs";
import { IFilter } from "../Router";
import genericLanguageBannerImage from "book-pages.jpg";

export const BannerContents: React.FunctionComponent<{
    title: string;
    about: string;
    bookCountMessage: string;
    filter: IFilter;
}> = props => (
    <>
        <Breadcrumbs />
        <h1
            className={css`
                font-size: 72px;
                margin-top: 0;
                flex-grow: 1; // push the rest to the bottom
            `}
        >
            {props.title}
        </h1>
        <div
            className={css`
                font-size: 24px;
                font-weight: normal;
                max-width: 600px;
                margin-bottom: 10px;
            `}
        >
            {props.about}
            <br />
            <br />
            <BookCount message={props.bookCountMessage} filter={props.filter} />
        </div>
    </>
);

export const HomeBanner: React.FunctionComponent<{
    filter: IFilter;
}> = props => (
    <div
        className={cx([
            "banner",
            css`
                background-image: url("https://bloomlibrary.org/assets/huyagirls.jpg");
                background-position: left;
                background-blend-mode: darken;
                background-color: rgba(0, 0, 0, 0.6); // fade the image to black
            `
        ])}
    >
        <BannerContents
            title="Library Home"
            about="Welcome to our Crowd Sourced library of free books that you can read, print, or adapt into your own language."
            bookCountMessage="We current have {0} books."
            filter={props.filter} // all books in circulation
        />
    </div>
);

export const LanguageBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <div
        className={cx([
            "banner",
            css({ backgroundImage: `url(book-pages.jpg)` }),
            css`
                background-position: left;
                background-blend-mode: multiply;
                background-color: rgb(128, 0, 128);
            `
        ])}
    >
        <BannerContents
            title={`${props.title}`}
            about="" // enhance: get text about the language from the database
            bookCountMessage="{0} books"
            filter={props.filter}
        />
    </div>
);
