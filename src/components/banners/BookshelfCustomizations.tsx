// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { IBannerSpec } from "./Banners";
import { LearnMoreLink } from "./LearnMoreLink";
import genericWorkshop from "../../assets/banners/generic-workshop.jpg";

const imageBase = "https://share.bloomlibrary.org/bookshelf-images/";
const enablingWritersBlurb =
    "This book-writing initiative was sponsored by a partnership of USAID, World Vision, and the Australian government through the All Children Reading Grand Challenge for Development.";

export function getProjectfBannerSpec(key: string): IBannerSpec {
    return (
        projectBannerCustomizations.find(s => s.key === key) ||
        (key.indexOf("Enabling Writers") > -1 &&
            projectBannerCustomizations.find(
                s => s.key === "defaultEnablingWriters"
            )) ||
        projectBannerCustomizations.find(s => s.key === "default")!
    );
}
// This may end up in the database, but we're keeping it in code for now until
// we really know what the model is going to be, and are convinced that the
// convenience of adding this info via a UI outweighs the convenience of
// the syntax highlighting and such that we get by working in the IDE
const projectBannerCustomizations: IBannerSpec[] = [
    {
        key: "default",
        bannerCss: css`
            background-color: #424141;
            #contrast-overlay {
                background-color: transparent;
            }
            //background-image: url(${genericWorkshop});
        `
    },
    {
        key: "defaultEnablingWriters",
        bannerCss: css`
            background-color: #424141;
            #contrast-overlay {
                background-color: transparent;
            }
        `,
        about: <div>{enablingWritersBlurb}</div>
    },
    {
        key:
            "Enabling Writers Workshops/Nigeria_American University of Nigeria",
        titleOverride:
            "Enabling Writers Workshop at the American University of Nigeria",
        imageCredits: <div>USAID</div>,
        bannerCss: css`
            h1 {
                font-size: 24pt;
            }
            background-image: url(${imageBase}Enabling-Writers-Nigeria-2017.jpg);
            background-position-y: 38%;
        `,
        about: (
            <div>
                In 2017, these books were created in Bloom at the American
                University of Nigeria.
                {enablingWritersBlurb}{" "}
                <LearnMoreLink href="https://www.aun.edu.ng/index.php/news-events/news/usaid-launches-enabling-writers-project-at-aun" />
            </div>
        )
    }
];
