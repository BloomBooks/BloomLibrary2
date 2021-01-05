import React, { ReactElement, useEffect, useState } from "react";
import SwiperCore, { Navigation, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.less";
import "swiper/components/navigation/navigation.less";
import "swiper/components/a11y/a11y.less";

SwiperCore.use([Navigation]);

export const CardSwiper: React.FunctionComponent<{
    children: ReactElement[];
    // Typically the swiper is a list. I can't find a way to configure it so that the element containing
    // the cards is a UL, but by setting this to 'list' and making items with role listitem we achieve
    // the same accessibility goals. This role becomes the value of the role attribute of the swiper
    // wrapper element, which is the immediate parent of the items. Note that it's not always a list, e.g.,
    // in the LanguageGroup a further-out element is a listbox and the items have role 'option'.
    // If you set a wrapperRole, make sure the children you pass have role listitem.
    wrapperRole?: string;
}> = (props) => {
    const swiperConfig = {
        preloadImages: false,
        lazy: true,
        watchSlidesVisibility: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        spaceBetween: 20,
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
        //a11y: true, // supposed to provide default accessibility behavior, but seems to do nothing.
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
            if (props.wrapperRole) {
                swiper.wrapperEl.setAttribute("role", props.wrapperRole);
            }
        }
    }, [props.children.length, props.wrapperRole, swiper]);

    return (
        <Swiper {...swiperConfig} slidesPerView="auto" onSwiper={setSwiper}>
            {props.children.map((x) => (
                <SwiperSlide style={{ width: "initial" }}>{x}</SwiperSlide>
            ))}
            <div className="swiper-button-next swiper-button"></div>
            <div className="swiper-button-prev swiper-button"></div>
        </Swiper>
    );
};
