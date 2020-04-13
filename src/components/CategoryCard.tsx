// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, Fragment } from "react";
import { CheapCard } from "./CheapCard";
import { RouterContext } from "../Router";
import { IFilter } from "../IFilter";
import Img from "react-image";
import { BookCount } from "./BookCount";
import teamIcon from "../assets/team.svg";
import { useTheme } from "@material-ui/core";
interface IProps {
    preTitle?: string;
    title: string;
    bookCount?: string;
    filter: IFilter;
    pageType: string;
    img: string;

    icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    // Some icons "look" bigger than others, so we can scale them to make them look more similar.
    // The number is a percentage less than (scale down) or greater than (scale up) 100.
    iconScale?: number;
    iconAltText?: string;
}

// CategoryCards are things like publisher, projects, organizations. "CollectionCard" might be a better name.
const CategoryCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    const theme = useTheme();

    const preTitleUI = props.preTitle ? (
        <div
            css={css`
                font-size: 9pt;
            `}
        >
            {props.preTitle}
        </div>
    ) : (
        undefined
    );

    function getTitleAndImageElement(imageElement: JSX.Element) {
        return (
            <Fragment>
                <h2
                    css={css`
                        text-align: center;
                        flex-grow: 1; // push the rest to the bottom5
                    `}
                >
                    {preTitleUI}
                    {props.title}
                </h2>
                {imageElement}
            </Fragment>
        );
    }

    const titleElementIfNoImage = getTitleAndImageElement(
        <img
            src={teamIcon}
            css={css`
                height: 40px;
                margin-bottom: 10px;
            `}
            alt="team"
        ></img>
    );

    const iconScale = props.iconScale ? props.iconScale / 100 : 1;
    const titleAndIconIfIconDefined =
        props.icon &&
        getTitleAndImageElement(
            <div
                css={css`
                    height: 80px;
                    margin: auto;
                    margin-bottom: 10px;
                `}
            >
                {props.icon({
                    // TODO: how to get alt text on this mysterious thing?
                    //props.iconAltText,
                    fill: theme.palette.secondary.main,
                    style: {
                        margin: "auto",
                        height: "70px",
                        width: `${60 * iconScale}px`
                    }
                })}
            </div>
        );

    return (
        <CheapCard
            css={css`
                width: 220px;
                padding: 10px;
            `}
            onClick={() => {
                router!.push({
                    title: props.title,
                    pageType: props.pageType ? props.pageType : "category",
                    filter: props.filter
                });
            }}
        >
            {titleAndIconIfIconDefined}

            {/* We want to show an image for the category if we have one */}
            {/* Note, react-image (Img) currently breaks strict mode. See app.tsx */}
            {!props.icon && (
                <Img
                    src={props.img}
                    css={css`
                        max-height: 129px;
                        max-width: 198px;
                        margin-left: auto;
                        margin-right: auto;
                        margin-top: auto; // at the moment, seems to work best without margin-bottom
                    `}
                    // While we're waiting, show the text title
                    loader={titleElementIfNoImage}
                    // If we could not get an image, show the text title
                    unloader={titleElementIfNoImage}
                />
            )}

            <div
                css={css`
                    margin-top: auto;
                    text-align: center;
                `}
            >
                <BookCount message={`{0} Books`} filter={props.filter} />
            </div>
        </CheapCard>
    );
};

export default CategoryCard;
