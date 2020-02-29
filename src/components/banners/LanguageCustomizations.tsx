// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { WikipediaLink } from "./Links";
import { IBannerSpec } from "./Banners";

const imageBase = "https://share.bloomlibrary.org/language-banner-images/";

export function getLanguageBannerSpec(key: string): IBannerSpec {
    return (
        languageBannerCustomizations.find(s => s.key === key) ||
        languageBannerCustomizations.find(s => s.key === "default")!
    );
}

// This may end up in the database, but we're keeping it in code for now until
// we really know what the model is going to be, and are convinced that the
// convenience of adding this info via a UI outweighs the convenience of
// the syntax highlighting and such that we get by working in the IDE
const languageBannerCustomizations: IBannerSpec[] = [
    {
        key: "waiting",
        bannerCss: css`
            #contrast-overlay {
                background-color: transparent;
            }
        `
    },

    {
        key: "default",
        bannerCss: css`
            background-color: blue;
            #contrast-overlay {
                background-color: transparent;
            }
        `
    },
    {
        key: "en",
        imageCredits: (
            <div>
                {"Image by "}
                <a href="https://pixabay.com/users/akosiberber-55135/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1328429">
                    akosiberber
                </a>{" "}
                from{" "}
                <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1328429">
                    Pixabay
                </a>
            </div>
        ),
        bannerCss: css`
            background-image: url(${imageBase}English-Union-Jack.jpg);
        `,
        about: (
            <div>
                We offer these English books for you to translate into your own
                language.
            </div>
        )
    },
    //Hausa
    {
        key: "ha",
        imageCredits: <div>Topeben / CC BY-SA</div>,
        pageBackground: "#f3d5b8",
        bannerCss: css`
            background-position-y: 20%;
            background-image: url(${imageBase}Nigeria.jpg);
            * {
                //color: black;
            }
            a {
                //color: black !important;
            }
        `,
        about: (
            <div>
                Hausa is mostly spoken throughout southern Niger and northern
                Nigeria.
            </div>
        )
    },
    {
        key: "tuz",
        imageCredits: <div>Colin Suggett / Used by permission</div>,
        bannerCss: css`
            background-position-y: 75%;
            background-image: url(${imageBase}Turka-sunset.jpg);
            #contrast-overlay {
                background-color: transparent; // this picture doesn't need the overlay
            }
            * {
                color: #fbd188;
            }
            a {
                color: #fbd188 !important;
            }
        `,
        about: (
            <div>
                <WikipediaLink query="turka_language" text="Turka" /> is spoken
                by the <WikipediaLink query="turka_people" text="Turka" />{" "}
                people in <WikipediaLink text="Burkina Faso" />.
            </div>
        )
    }
];
