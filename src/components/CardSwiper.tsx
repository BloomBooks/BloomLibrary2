import React, { ReactElement, useEffect, useState } from "react";
import Swiper from "react-id-swiper";

export const CardSwiper: React.FunctionComponent<{
    children: ReactElement[];
}> = (props) => {
    const swiperConfig = {
        preloadImages: false,
        lazy: true,
        watchSlidesVisibility: true,
        navigation: {
            nextEl: ".swiper-button-next.swiper-button",
            prevEl: ".swiper-button-prev.swiper-button",
        },
        spaceBetween: 20,
        slidesPerView: "auto",
        // I'm not clear why this is needed now and wasn't in earlier versions.
        // It allows scrolling a bit further with the right arrow than is possible by default,
        // as if the row of cards we're scrolling through had an extra 100px of
        // white space at the end that's included in the scroll area. Without this,
        // we don't see the whole of the More card before the scroll arrow disappears,
        // making it very easy to click the More card unintentionally.
        slidesOffsetAfter: 100,
        // We don't want any slidesOffsetBefore, but if it is zero and slidesOffsetAfter is not,
        // watchOverflow doesn't work. See https://github.com/nolimits4web/swiper/pull/3291.
        slidesOffsetBefore: 0.01,
        threshold: 10, // drag of less than 10px not recognized, therefore acts as normal click.
        //preventClicks: false, // Even a long drag activates the link
        watchOverflow: true, // prevents sliding and showing arrows when all cards fit
    };

    const [swiper, setSwiper] = useState<any | null>(null);
    useEffect(() => {
        if (swiper && props.children.length) {
            // When the number of children change, if we already had cards and the user has scrolled,
            // we want to reset the scroll back to the left.
            // This prevents a UI issue when user has scrolled to the right and then filters the cards.
            // The cards would otherwise be off the left side of the screen.

            // This check is just for optimization.
            if (swiper.activeIndex !== 0) {
                swiper.slideTo(0);
            }
        }
    }, [props.children.length, swiper]);

    return (
        <Swiper {...swiperConfig} getSwiper={setSwiper}>
            {props.children}
        </Swiper>
    );
};
