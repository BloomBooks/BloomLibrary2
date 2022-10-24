import React, { ReactElement } from "react";
import { ICardSpec } from "./CardGroup";

export interface ICardSwiperProps {
    data: any[];
    // Given one of the items in data (and its index), return the react element that should be
    // shown for that card when it is visible.
    getReactElement: (card: any, index: number) => ReactElement;

    // Typically the swiper is a list. I can't find a way to configure it so that the element containing
    // the cards is a UL, but by setting this to 'list' and making items with role listitem we achieve
    // the same accessibility goals. This role becomes the value of the role attribute of the swiper
    // wrapper element, which is the immediate parent of the items. Note that it's not always a list, e.g.,
    // in the LanguageGroup a further-out element is a listbox and the items have role 'option'.
    // If you set a wrapperRole, make sure the children you pass have role listitem.
    wrapperRole?: string;

    cardSpec: ICardSpec;
}

// This is wrapped so that we can keep all the javascript involved in the CardSwiper
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const CardSwiperCodeSplit: React.FunctionComponent<ICardSwiperProps> = (
    props
) => {
    const CardSwiperLazy = React.lazy(
        () => import(/* webpackChunkName: "cardSwiper" */ "./CardSwiper")
    );
    return (
        <React.Suspense fallback={<div>Loading Cards...</div>}>
            <CardSwiperLazy {...props} />
        </React.Suspense>
    );
};
