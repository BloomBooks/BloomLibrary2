import React from "react";
import Swiper, { GetSwiper } from "react-id-swiper";

export const CardSwiper: React.FunctionComponent<{
    cards: JSX.Element[];
    getSwiper?: GetSwiper;
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
    return (
        <Swiper {...swiperConfig} getSwiper={props.getSwiper}>
            {props.cards}
        </Swiper>
    );
};
