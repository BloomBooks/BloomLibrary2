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
    };

    const [swiper, setSwiper] = useState<any | null>(null);
    useEffect(() => {
        if (swiper && props.children.length) {
            // Need to slide back to the beginning.
            // This prevents a UI issue when user has slid over to the right and then
            // filters the items. They would then be off the left side of the screen.

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
