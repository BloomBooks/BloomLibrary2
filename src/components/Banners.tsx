/*  ------- PROBLEM  -------------
In this file, I (JH) haven't been able to get the new @emotion to work (see BookDetail for how it should work,
with jsx and css={css``} and all, instead of css={}. When that new method is used, I get "react is undefined". */
import css from "@emotion/css/macro";
import React, { Fragment } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core"; // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE // <---- CURRENTLY UNUSED, SEE "PROBLEM" ABOVE
/** @jsx jsx */

import { BookCount } from "./BookCount";
import { Breadcrumbs } from "./Breadcrumbs";
import { IFilter } from "../IFilter";
import { useGetLanguageInfo } from "../connection/LibraryQueryHooks";
export const BannerContents: React.FunctionComponent<{
    title: string;
    about: string;
    bookCountMessage: string;
    filter: IFilter;
}> = props => {
    const lines = props.title.split("/");
    console.assert(
        lines.length < 3,
        "display code only supports one '/' in the title"
    );
    const secondLine = lines.length > 1 ? <div> {lines[1]}</div> : "";
    return (
        <div
            css={css`
                margin-left: 20px;
            `}
        >
            <Breadcrumbs />
            <h1
                css={css`
                    font-size: ${lines.length > 1 ? 36 : 72}px;
                    margin-top: 0;
                    //flex-grow: 1; // push the rest to the bottom
                `}
            >
                {lines[0]}
                {secondLine}
            </h1>
            <div
                css={css`
                    font-size: 24px;
                    font-weight: normal;
                    max-width: 600px;
                    margin-bottom: 10px;
                `}
            >
                {props.about}
                {props.filter.language && (
                    <Fragment>
                        {props.filter.language.length === 3 && (
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://www.ethnologue.com/language/${props.filter.language}`}
                            >
                                Ethnologue
                            </a>
                        )}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://en.wikipedia.org/w/index.php?title=ISO_639:${props.filter.language}&redirect=yes`}
                        >
                            Wikipedia
                        </a>
                    </Fragment>
                )}
                <br />
                <br />
                <BookCount
                    message={props.bookCountMessage}
                    filter={props.filter}
                />
            </div>
        </div>
    );
};

export const HomeBanner: React.FunctionComponent<{
    filter: IFilter;
}> = props => {
    //const backgroundColor = "rgba(210, 227, 254,.2)";
    return (
        <div
            className={"banner"}
            css={
                // TODO: move this image into this code base and reference as a local asset
                css`
                    background-image: url("bloomgirls.jpg");
                    background-position: right;
                    background-size: contain;

                    /* background-blend-mode: darken;
                background-color: rgba(0, 0, 0, 0.6); // fade the image to black */
                `
            }
        >
            <div
                css={css`
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 1) 0%,
                        rgba(255, 255, 255, 1)
                            /* position near the width of image, which is right aligned */
                            calc(100% - 507px),
                        rgba(255, 255, 255, 0.2) 100%
                    );
                `}
            >
                <BannerContents
                    title="Library Home"
                    about="Welcome to our Crowd Sourced library of free books that you can read, print, or adapt into your own language."
                    bookCountMessage="We currently have {0} books."
                    filter={props.filter} // all books in circulation
                />
            </div>
        </div>
    );
};

export const LanguageBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => {
    const queryLanguageInfo = useGetLanguageInfo(props.filter.language!);
    let imageUrl = null;
    if (queryLanguageInfo && queryLanguageInfo.response) {
        imageUrl =
            queryLanguageInfo.response["data"]["results"][0].bannerImageUrl;
    }
    // enhance: need to do something nice about the transition where we are waiting to find out if there is a custom image
    // enhance: need to factor out this custom image stuff as we also need it for all feature and tag-oriented pages (projects, topics)
    const backgroundStyle = imageUrl
        ? css`
              background-blend-mode: darken;
              background-color: gray;
          `
        : css`
              background-blend-mode: multiply;
              background-color: rgb(128, 0, 128);
          `;
    return (
        <div
            className={"banner"}
            css={css`
                background-image: url(${imageUrl || "book-pages.jpg"});
                background-position: left;
                background-size: cover;
                ${backgroundStyle}
            `}
        >
            <BannerContents
                title={`${props.title}`}
                about="" // enhance: get text about the language from the database
                bookCountMessage="{0} books"
                filter={props.filter}
            />
        </div>
    );
};

export const ProjectBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <div
        className={"banner"}
        css={css`
            background-image: url(generic-workshop.jpg);
            background-position: left;
            background-blend-mode: saturation;
            background-color: rgb(70, 138, 150);
        `}
    >
        <BannerContents
            title={`${props.title}`}
            about="" // enhance: get text about the language from the database
            bookCountMessage="{0} books"
            filter={props.filter}
        />
    </div>
);

export const SearchBanner: React.FunctionComponent<{
    filter: IFilter;
}> = props => {
    return (
        <div
            css={css`
                background-color: #1c1c1c;
                color: whitesmoke;
                padding-bottom: 10px;
                padding-left: 20px;
            `}
        >
            <Breadcrumbs />
            <BookCount filter={props.filter} />
        </div>
    );
};
