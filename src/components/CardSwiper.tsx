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
