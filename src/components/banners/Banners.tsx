import css from "@emotion/css/macro";
import React, { Fragment } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx, SerializedStyles } from "@emotion/core";
/** @jsx jsx */

import { BookCount } from "../BookCount";
import { Breadcrumbs } from "../Breadcrumbs";
import { IFilter } from "../../IFilter";
import { Link, Button, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/InfoOutlined";

export const BannerContents: React.FunctionComponent<{
    title: string;
    bookCountMessage: string;
    filter: IFilter;
    about?: JSX.Element;
    imageCredits?: JSX.Element;
    bannerCss?: SerializedStyles;
}> = props => {
    const titleLines = props.title.split("/");
    console.assert(
        titleLines.length < 3,
        "display code only supports one '/' in the title"
    );
    const secondTitleLine =
        titleLines.length > 1 ? <div> {titleLines[1]}</div> : "";
    return (
        <div
            css={css`
                //height: 100%;
                display: flex;
                flex-direction: column;
                a {
                    text-decoration: underline;
                }
                /* https://www.nngroup.com/articles/text-over-images/ */
                #contrast-overlay {
                    background-color: rgba(0, 0, 0, 0.4);
                }
                background-size: cover;
                * {
                    color: white;
                }
                // this can override any of the above
                ${props.bannerCss}
            `}
        >
            <div id="contrast-overlay">
                <div
                    css={css`
                        margin-left: 20px;
                        flex-grow: 2;
                        display: flex;
                        flex-direction: column;
                    `}
                >
                    <Breadcrumbs />
                    <h1
                        css={css`
                            font-size: ${titleLines.length > 1 ? 36 : 72}px;
                            margin-top: 0;
                            //flex-grow: 1; // push the rest to the bottom
                        `}
                    >
                        {titleLines[0]}
                        {secondTitleLine}
                    </h1>

                    <div
                        css={css`
                            font-size: 24px;
                            font-weight: normal;
                            max-width: 600px;
                            margin-bottom: 10px;
                        `}
                    >
                        {props.about ||
                            (props.filter.language && (
                                <Fragment>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://en.wikipedia.org/w/index.php?title=ISO_639:${props.filter.language}&redirect=yes`}
                                    >
                                        Wikipedia
                                    </a>
                                </Fragment>
                            ))}
                    </div>
                    <div
                        css={css`
                            margin-top: auto;
                            margin-bottom: 5px;
                            display: flex;
                            justify-content: space-between;
                            width: 100%;
                        `}
                    >
                        <BookCount
                            message={props.bookCountMessage}
                            filter={props.filter}
                        />
                        <Tooltip
                            // didn't work: classes={{ popper: "popper", tooltip: "tooltip" }}
                            title={props.imageCredits}
                            css={css`
                                /* didn't work .tooltip {
                            border: solid blue !important;
                            background-color: black;
                        } */
                            `}
                            placement="left-end"
                        >
                            <Button
                                classes={{ root: "zzzzzzzzzzzzzzzzzz" }}
                                aria-label="Image Credits"
                                css={css`
                                    padding: 0;
                                `}
                            >
                                <InfoIcon fontSize="small" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
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
                    background-image: url("banners/bloomgirls.jpg");
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
                    about={
                        <div>
                            "Welcome to our Crowd Sourced library of free books
                            that you can read, print, or adapt into your own
                            language."
                        </div>
                    }
                    bookCountMessage="We currently have {0} books."
                    filter={props.filter} // all books in circulation
                    bannerCss={css`
                        * {
                            color: black;
                        }
                        #contrast-overlay {
                            background-color: transparent;
                        }
                    `}
                />
            </div>
        </div>
    );
};

// Open a new tab when this is clicked
export const ExternalLink: React.FunctionComponent<{
    href: string;
}> = props => (
    <React.Fragment>
        <Link target="_blank" color="secondary" href={props.href}>
            {props.children}
        </Link>
    </React.Fragment>
);

export const ProjectBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    bannerImageUrl: string;
}> = props => (
    <div
        className={"banner"}
        css={css`
            background-image: url(${props.bannerImageUrl});
            background-position: left;
            background-blend-mode: saturation;
            background-color: rgb(70, 138, 150);
        `}
    >
        <BannerContents
            title={`${props.title}`}
            about={<div></div>} // enhance: get text about the project
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
