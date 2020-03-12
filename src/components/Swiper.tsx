// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import ReactIdSwiper, { ReactIdSwiperChildren } from "react-id-swiper";
import React from "react";

const swiperConfig = {
    preloadImages: false,
    //lazy: true,
    watchSlidesVisibility: true,
    navigation: {
        nextEl: ".swiper-button-next.swiper-button",
        prevEl: ".swiper-button-prev.swiper-button"
    },
    spaceBetween: 20,
    slidesPerView: "auto"
};

export const Swiper: React.FunctionComponent<{
    children?: ReactIdSwiperChildren;
}> = props => {
    return <ReactIdSwiper {...swiperConfig}>{props.children}</ReactIdSwiper>;
};
