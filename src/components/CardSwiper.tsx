import { css } from "@emotion/react";

import React, { ReactElement, useEffect, useRef, useState } from "react";
import SwiperCore, { Navigation, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/a11y/a11y.min.css";
import { useResponsiveChoice } from "../responsiveUtilities";
import { ICardSpec } from "./CardGroup";
import { commonUI } from "../theme";

SwiperCore.use([Navigation, A11y]);

export const swiperConfig: Swiper = {
    preloadImages: false,
    lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 3,
    },
    watchSlidesVisibility: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
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
    //a11y: true, // supposed to provide default accessibility behavior, but seems to do nothing.
};

// This version is much more performant for long lists of cards, many of which are not visible, especially in
// small windows.
// Enhance: this could be made generic, with a type param indicating that the type of objects in data
// is the same as the type passed as the first argument of getReactElement
export const CardSwiperLazy: React.FunctionComponent<{
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
}> = (props) => {
    const [swiper, setSwiper] = useState<any | null>(null);
    const getResponsiveChoice = useResponsiveChoice();
    const [showAll, setShowAll] = useState(false);
    const indexOfLastVisibleCard = useRef(1);
    useEffect(() => {
        if (swiper && props.data.length) {
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
    }, [props.data.length, props.wrapperRole, swiper]);

    // Since we're not indicating anywhere how many items we have, 20 should be plenty
    // to fill the screen for any card size we're using. As soon as the user scrolls,
    // we'll show them all. Until then, we can save some rendering effort.
    const dataToRender = showAll ? props.data : props.data.slice(0, 20);

    return (
        // I believe it ought to be possible to use the 'virtual' feature of Swiper so that only the visible
        // cards get created at all, but I had trouble getting it to work, particularly in LanguageGroup.
        // I think the problem is that something in Downshift expects all the children to be created,
        // but that may not be exactly right. In any case, we gain most of the benefit in current cases
        // by generating a trivial placeholder for non-visible elements.
        // It ought to be possible to declare the argument to the SwiperSlide content function as
        // {isVisible} (immediately deconstructing the object we are passed), but I could not persuade
        // typescript to accept it.
        // It may not be necessary to force the width of the placeholders; I didn't try without it.
        // The Swiper stylesheet sets SwiperSlides to be 100% width for some reason; we want them
        // to be the size of the generated child element, so I gave them a style that forces "initial"
        // to make the cards use the size of their content.

        <Swiper
            {...swiperConfig}
            spaceBetween={props.cardSpec.cardSpacingPx}
            onSwiper={setSwiper}
            onSlideChange={() => setShowAll(true)}
            onScroll={() => setShowAll(true)}
            css={css`
                /* we don't want to see a grey'd "back" or "next button"; just don't show it */
                .swiper-button-disabled {
                    visibility: hidden;
                }

                // Make the buttons the same height as the cards so clicking above or
                // below the buttons performs the next/previous action
                .swiper-button-next {
                    right: 0;
                }
                .swiper-button-prev {
                    left: 0;
                }
                .swiper-button {
                    // Note, this should be the same as the light grey used
                    // elsewhere, e.g.  in the Language Card secondary titles.
                    // But that is set to #767676 (the minimal grey that passes
                    // contrast tests) but if you look at it on screen, it
                    // actually comes out closer to a5a5a5 (of course zoomed in,
                    // the pixels of the text are in multiple shades).
                    color: #a5a5a5;
                    padding-left: 10px;
                    padding-right: 10px;
                    margin-top: 0;
                    height: 100%;
                    top: 0;
                    ::after {
                        font-size: ${getResponsiveChoice(16, 32)}px;
                    }
                }

                &:hover .swiper-button {
                    color: ${commonUI.colors.bloomRed};
                }
                // Make the fading effect on the right indicating there are more cards.
                // enhance: it would be nice NOT to do this if all the cards just exactly fit.
                &:after {
                    content: "";
                    width: 100px;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    right: 0;
                    z-index: 1;
                    // Allow clicks through the overlay to the button underneath
                    pointer-events: none;
                    background: linear-gradient(
                        90deg,
                        rgba(250, 250, 250, 0),
                        rgba(250, 250, 250, 1)
                    );
                }

                // I wanted to have Cheap Card handle all the spacing between cards whether in a swiper context or not.
                // But a 20px margin on the card with the spaceBetween config set to 0 caused us to not be able to
                // swipe far enough to see the last card in some scenarios. So I had to revert to using swiper's spaceBetween.
                // Thus we have to get rid of the card's margin here or it would be doubled.
                & .cheapCard {
                    margin-right: 0;
                }
            `}
        >
            {dataToRender.map((card: any, index: number) => (
                <SwiperSlide
                    style={{
                        width: "initial",
                    }}
                    key={index}
                >
                    {(args: any) => {
                        if (
                            args.isVisible &&
                            index > indexOfLastVisibleCard.current
                        ) {
                            indexOfLastVisibleCard.current = index;
                        }

                        // Any card we've ever rendered fully we will keep rendering.
                        // The main reason for not fully rendering is to save time on the ones we haven't seen yet.
                        // Once they are rendered, we'd prefer not to have to do it again.
                        // Also, we've seen a problem where the card on the left that is scrolling off the
                        // screen disappears before it is all the way off. We think it is because it
                        // was being re-rendered as a placeholder before it was off-screen.
                        return args.isVisible ||
                            index <= indexOfLastVisibleCard.current ? (
                            props.getReactElement(card, index)
                        ) : (
                            <div
                                style={{
                                    width: `${props.cardSpec.cardWidthPx}px`,
                                }}
                            />
                        );
                    }}
                </SwiperSlide>
            ))}
            <div className="swiper-button-next swiper-button"></div>
            <div className="swiper-button-prev swiper-button"></div>
        </Swiper>
    );
};
