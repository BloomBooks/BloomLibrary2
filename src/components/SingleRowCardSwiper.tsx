import React, { ReactElement, useEffect, useState } from "react";
import SwiperCore, { Navigation, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/a11y/a11y.min.css";
import { swiperConfig } from "./CardSwiper";

SwiperCore.use([Navigation, A11y]);

// Almost obsolete original swiper.
// Jan 2020 I (JH) renaming this because I just wasted 30
// minutes wondering why nothing I did ever effected ANYTHING, only to discover
// that the *real* swiper is called CardSwiperLazy. I cannot find
// anywhere where this is used. When we do find it, for goodness sake just get
// rid of this figure out how to make the normal CardSwiperLazy (or it's better
// name, if we have gotten to that point) to work.
export const SingleRowCardSwiper: React.FunctionComponent<{
    children: ReactElement[];
    // Typically the swiper is a list. I can't find a way to configure it so that the element containing
    // the cards is a UL, but by setting this to 'list' and making items with role listitem we achieve
    // the same accessibility goals. This role becomes the value of the role attribute of the swiper
    // wrapper element, which is the immediate parent of the items. Note that it's not always a list, e.g.,
    // in the LanguageGroup a further-out element is a listbox and the items have role 'option'.
    // If you set a wrapperRole, make sure the children you pass have role listitem.
    wrapperRole?: string;
}> = (props) => {
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
        <Swiper {...swiperConfig} onSwiper={setSwiper}>
            {React.Children.map(props.children, (x, index) => (
                <SwiperSlide
                    key={index}
                    style={{
                        width: "initial",
                    }}
                >
                    {x}
                </SwiperSlide>
            ))}
            <div className="swiper-button-next swiper-button"></div>
            <div className="swiper-button-prev swiper-button"></div>
        </Swiper>
    );
};
