// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { ReactElement } from "react";
import LazyLoad from "react-lazyload";
import { CardSwiperLazy } from "./CardSwiper";
import { ICollection } from "../model/ContentInterfaces";
import {
    CollectionLabel,
    useGetLocalizedCollectionLabel,
} from "../localization/CollectionLabel";
import { useResponsiveChoice } from "../responsiveUtilities";
import { ICardSpec } from "./RowOfCards";
import { BookCount } from "./BookCount";
import { getFilterForCollectionAndChildren } from "../model/Collections";

interface IProps {
    collection: ICollection;
    layout: string;
    data: any[];
    getCards: (x: any, index: number) => ReactElement;
    cardSpec: ICardSpec;
}

export const CardGroup: React.FunctionComponent<IProps> = (props) => {
    const getResponsiveChoice = useResponsiveChoice();
    //tricky to test because it's for lazy loading
    const rowHeightPx = getResponsiveChoice(
        props.cardSpec.cardHeightPx + 10,
        props.cardSpec.cardHeightPx + 20
    ) as number;
    const cards = (
        <div
            // We want this to be a UL. But accessibility checker insists UL may have
            // only LI as children, and a couple of layers of Swiper divs get in the way.
            css={css`
                padding-left: 0;
            `}
        >
            <CardSwiperLazy
                wrapperRole="list"
                data={props.data}
                getReactElement={props.getCards}
                cardSpec={props.cardSpec}
            />
        </div>
    );

    let group;
    switch (props.layout) {
        case "layout: description-followed-by-row-of-books":
            break;
        default:
            const bookCountSize = getResponsiveChoice(10, 14); // same as book card count
            const heading = props.collection.kind !== "Simple Page Links" && (
                <div
                    css={css`
                        display: flex;
                        flex-direction: row;
                        align-items: baseline;
                    `}
                >
                    <h1
                        css={css`
                            font-size: ${getResponsiveChoice(10, 14)}pt;
                        `}
                    >
                        <CollectionLabel
                            collection={props.collection}
                        ></CollectionLabel>
                    </h1>
                    {props.collection.showBookCountInRowDisplay && (
                        <div
                            css={css`
                                font-size: ${bookCountSize}px;
                                margin-left: ${bookCountSize}px; // Convenient to use the same number
                            `}
                        >
                            <BookCount
                                filter={
                                    props.collection.filter
                                        ? props.collection.filter
                                        : getFilterForCollectionAndChildren(
                                              props.collection
                                          )
                                }
                            />
                        </div>
                    )}
                </div>
            );
            group = (
                <React.Fragment>
                    {heading}
                    {cards}
                </React.Fragment>
            );
            break;
    }
    const collectionLabel = useGetLocalizedCollectionLabel(props.collection);

    return (
        // Enhance: LazyLoad has parameters (height and offset) that should help
        // but so far I haven't got them to work well. It has many other
        // parameters too that someone should look into. Make sure to test
        // with the phone sizes in the browser debugger, and have the network
        // tab open, set to "XHR". That will show you when a new query happens
        // because this has loaded a new BookGroupInner.
        // If the params are good, this list will grow as you scroll.
        // If the params are bad, some groups at the end will NEVER show.

        // Set offset to keep one more item expanded, so keyboard shortcuts can find them
        // Set placeholder so that ul child items are of correct accessible class.
        // Note that explicit placeholders must control their own height.

        /* Note, this currently breaks strict mode. See app.tsx */
        <LazyLoad
            height={rowHeightPx}
            offset={rowHeightPx}
            placeholder={
                <li
                    className="placeholder"
                    style={{ height: `${rowHeightPx}px` }}
                ></li>
            }
        >
            <li
                css={css`
                    margin-top: ${getResponsiveChoice(15, 20)}px;
                `}
                role="region"
                aria-label={collectionLabel}
            >
                {group}
            </li>
        </LazyLoad>
    );
};
