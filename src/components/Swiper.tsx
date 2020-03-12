// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import ReactIdSwiper, {
    ReactIdSwiperChildren,
    SwiperInstance
} from "react-id-swiper";
import React, { useState, useEffect, ReactElement } from "react";

const swiperConfig = {
    preloadImages: false,
    lazy: true,
    watchSlidesVisibility: true,
    navigation: {
        nextEl: ".swiper-button-next.swiper-button",
        prevEl: ".swiper-button-prev.swiper-button"
    },
    spaceBetween: 20,
    slidesPerView: "auto"
};

export const Swiper: React.FunctionComponent<{
    children: ReactElement[];
}> = props => {
    /* had no effect. Trying to work around a bug where swiper can't handle async adding of the elements
    const [swiper, updateSwiper] = useState<SwiperInstance | undefined>(null);
    useEffect(() => {
        if (swiper) {
            //console.log(`updating swiper id:${props.id}  ` + swiper);
            swiper?.update();
            if (props.onUpdate) {
                props.onUpdate();
            }
        }
    }, [swiper, props.children]);
    */
    return props.children?.length === 0 ? (
        <span>{"Loading..."}</span>
    ) : (
        <ReactIdSwiper
            shouldSwiperUpdate={true}
            rebuildOnUpdate={true}
            {...swiperConfig}
            /* had no effect
            getSwiper={(s: SwiperInstance) => {
                window.setTimeout(() => {
                    s.update();
                    updateSwiper(s);
                    console.log("updated swiper");
                }, 1000);
            }}
            */
        >
            {props.children}
        </ReactIdSwiper>
    );
};
