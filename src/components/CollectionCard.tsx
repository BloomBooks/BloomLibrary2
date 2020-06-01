// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { Fragment } from "react";
import { CheapCard } from "./CheapCard";
import { IFilter } from "../IFilter";
import { BookCount } from "./BookCount";
//import teamIcon from "../assets/team.svg";
import booksIcon from "../assets/books.svg";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { ImgWithCredits } from "../ImgWithCredits";
interface IProps {
    title: string;
    richTextLabel?: Document;
    hideTitle?: boolean;
    bookCount?: string;
    href: string;
    filter: IFilter;
    img: string;
    credits?: string;
    altText?: string;
}

// Show a card with the name, icon, count, etc. of the collection. If the user clicks on it, they go to a page showing the collection.
export const CollectionCard: React.FunctionComponent<IProps> = (props) => {
    let titleElement = <React.Fragment />;
    let titleElementIfNoImage = <div>{props.title}</div>;
    if (!props.hideTitle) {
        titleElementIfNoImage = <React.Fragment />; // showing title anyway, don't need it in place of image
        titleElement = (
            <Fragment>
                <div
                    css={css`
                        text-align: center;
                        font-size: 12pt; // from chrome default for h2, which this element used to be
                        font-weight: bold;
                        flex-grow: 1; // push the rest to the bottom
                        margin-bottom: 5px;
                        // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                        // Here we define what they will look like.
                        h1,
                        h2,
                        h3,
                        p {
                            text-align: center;
                            margin-bottom: 0;
                            margin-top: 0;
                            font-weight: bold;
                        }
                        h1 {
                            font-size: 16px;
                        }
                        h2 {
                            font-size: 14px;
                        }
                        h3 {
                            font-size: 12px;
                        }
                        p {
                            font-size: 10px;
                        }
                    `}
                >
                    {props.richTextLabel
                        ? documentToReactComponents(props.richTextLabel)
                        : props.title}
                </div>
            </Fragment>
        );
    }

    let imgElement = <React.Fragment />;
    if (!props.img) {
        imgElement = (
            <img
                src={booksIcon}
                css={css`
                    height: 40px;
                    margin-bottom: 10px;
                `}
                alt="A stack of generic books"
            ></img>
        );
    } else if (props.img !== "none") {
        const maxHeight = props.hideTitle ? 129 : 100;
        // Usual case, show the image defined in the collection
        imgElement = (
            <ImgWithCredits
                credits={props.credits}
                src={props.img}
                css={css`
                    max-height: ${maxHeight}px;
                    max-width: 198px;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: auto;
                    margin-bottom: ${props.hideTitle ? "auto" : "10px"};
                `}
                // While we're waiting, show the text title
                loader={titleElementIfNoImage}
                // If we could not get an image, show the text title
                unloader={titleElementIfNoImage}
                // If we have an explicit altText, use it. Otherwise,
                // if we're hiding the title, we'd better have it as alt-text.
                // If we're showing the title anyway, the image adds no useful content,
                // so display an explicit empty alt text to indicate it is only decorative.
                alt={props.altText || (props.hideTitle ? props.title : "")}
            />
        );
    }

    const { bookCount, ...propsToPassDown } = props; // prevent react warnings
    // make the cards smaller vertically if they purposely have no image, not even
    // the default one. Otherwise, let the default CheapCard height prevail.
    const height = props.img === "none" ? "height: 100px" : "";
    return (
        <CheapCard
            {...propsToPassDown} // needed for swiper to work
            css={css`
                width: 220px;
                padding: 10px;
                ${height}
            `}
            href={props.href}
        >
            {titleElement}
            {imgElement}

            <div
                css={css`
                    margin-top: auto;
                    text-align: center;
                `}
            >
                {props.filter && (
                    <BookCount message={`{0} Books`} filter={props.filter} />
                )}
            </div>
        </CheapCard>
    );
};
