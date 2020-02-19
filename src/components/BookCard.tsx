// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";
import { CheapCard } from "./CheapCard";
import LazyLoad from "react-lazyload";
import { RouterContext } from "../Router";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { getUniqueLanguages, getNameDisplay } from "./LanguageLink";
import { getHarvesterProducedThumbnailUrl } from "./BookDetail/ArtifactHelper";

import { ReactComponent as ActivityIcon } from "../assets/Activity.svg";
import { ReactComponent as ComicIcon } from "../assets/Comic.svg";
import { ReactComponent as MotionIcon } from "../assets/Motion.svg";
import { ReactComponent as SignLanguageIcon } from "../assets/Sign Language.svg";
import { ReactComponent as TalkingBookIcon } from "../assets/Talking Book.svg";
import { ReactComponent as VisuallyImpairedIcon } from "../assets/Visually Impaired.svg";
import { Book } from "../model/Book";

interface FeatureOption {
    feature: string;
    icon: (props: object) => any;
    languageDependent: boolean;
}

// For each possible feature, this gives its name and whether it is language dependent
// (appears next to the language in the languages list) or not (appears on the left of the
// feature bar). In addition, the icon is given as a function that takes some props and
// returns a react component.
// It would be simpler to, e.g., import comicIcon from "../assests/Comic.svg"
// (which yields a url), then let the icon: simply be that string, and let the code
// that wants the icon make an <img> with src={feature.icon}. But then we can't use
// fill: to control the color.
// To control the color, I had to remove the fill:"black" properties on the individual
// paths in the SVGs...nothing I found could override that. Then import them
// as react components, as above. Then we need to be able to style them, differently
// in different places. So icon can't just be a fixed react component.
// Thus, I ended up making icon a function that takes the props and builds the
// appropriate react component containing the right icon and using the supplied props.
const featureOptions: FeatureOption[] = [
    {
        feature: "talkingBook",
        icon: props => <TalkingBookIcon {...props}></TalkingBookIcon>,
        languageDependent: true
    },
    {
        feature: "blind",
        icon: props => <VisuallyImpairedIcon {...props}></VisuallyImpairedIcon>,
        languageDependent: true
    },
    {
        feature: "comic",
        icon: props => <ComicIcon {...props}></ComicIcon>,
        languageDependent: false
    }, // todo: can't find this feature, is there another name?
    {
        feature: "motion",
        icon: props => <MotionIcon {...props}></MotionIcon>,
        languageDependent: false
    },
    {
        feature: "signLanguage",
        icon: props => <SignLanguageIcon {...props}></SignLanguageIcon>,
        languageDependent: true
    },
    {
        feature: "activity",
        icon: props => <ActivityIcon {...props}></ActivityIcon>,
        languageDependent: false
    } // todo: can't find this feature, is there another name?
];

export const getLanguageFeatures = (
    features: string[] | undefined,
    lang: string
): FeatureOption[] => {
    if (!features) return [];
    return features
        .map(
            // for each feature in the book, look for a feature option
            // such that the book feature starts with the feature option
            // followed by a colon followed by the code for
            // the language of the current iteration.
            // For example, if we've just inserted 'English',
            // we will find a matching feature icon for
            // things like talkingBook:en and blind:en.
            f =>
                featureOptions.filter(
                    x =>
                        f.startsWith(x.feature + ":") &&
                        f.split(":")[1] === lang
                )[0]
        )
        .filter(f => !!f); // drop the features where there was no match
};

const BookCardWidth = 140;

interface IProps {
    onBasicBookInfo: IBasicBookInfo;
    className?: string;
    lazy: boolean;
}

export const BookCard: React.FunctionComponent<IProps> = props => {
    const router = useContext(RouterContext);
    const legacyStyleThumbnail =
        props.onBasicBookInfo.baseUrl + "thumbnail-256.png";
    const harvestedThumbnailUrl =
        getHarvesterProducedThumbnailUrl(props.onBasicBookInfo) ||
        legacyStyleThumbnail;


    // Figure out what level, if any, to show in the feature bar.
    const levelTag = props.onBasicBookInfo.tags
        ? props.onBasicBookInfo.tags.filter(t =>
              t.toLowerCase().startsWith("level:")
          )[0]
        : undefined;
    const level = levelTag ? levelTag.split(":")[1]?.trim() : "";
    const levelLabel = levelTag
        ? levelTag[0].toUpperCase() + levelTag.substring(1)
        : "";
    // The color of the feature bar is determined by the level, if any
    // (except if there's no level it will be grey or white depending on
    // whether any features are shown.)
    let featureBarColor = "rgb(212,212,212)"; // default grey
    switch (level) {
        case "1":
            featureBarColor = "rgb(246,188,46)";
            break;
        case "2":
            featureBarColor = "rgb(145,103,142)";
            break;
        case "3":
            featureBarColor = "rgb(65,149,163)";
            break;
        case "4":
            featureBarColor = " #439C77";
            break;
    }
    const featureBarHeight = 16;

    // Now figure out what features will show in the feature bar.
    // They have to occur in the book and not be language-dependent.
    const featureBarFeatures = props.onBasicBookInfo.features
        ? props.onBasicBookInfo.features
              .map(
                  f =>
                      featureOptions.filter(
                          x => x.feature === f && !x.languageDependent
                      )[0]
              )
              .filter(f => !!f)
        : [];
    const featureElements = featureBarFeatures.map(feature =>
        feature.icon({
            fill: "black", // They must have a color specified or will be transparent
            // I can't figure out how to make emotion CSS work here.
            style: {
                // I'd prefer to just specify a height and let width be automatic.
                // But then the browser keeps the original width of the SVG and pads
                // with (too much) white space.
                // I was afraid specifying both would mess up aspect ratios but
                // it doesn't seem to.
                height: featureBarHeight - 4 + "px",
                width: featureBarHeight - 4 + "px",
                marginLeft: "2px",
                marginTop: "2px"
            }
        })
    );

    // If we don't have anything at all in the feature bar hide it (but it still
    // takes up space to keep other things aligned).
    const anyFeatureBarContent = !!level || featureBarFeatures.length > 0;
    if (!anyFeatureBarContent) featureBarColor = "#fff";

    // Now figure out what to show in the language list area. It's a mix
    // of simple text nodes and possibly feature icons.
    const languageElements = [];
    for (const language of getUniqueLanguages(
        props.onBasicBookInfo.languages
    )) {
        languageElements.push(getNameDisplay(language));
        // Looking for features that the book has with this language code attached,
        // such as talkingBook:en
        const langFeatures = getLanguageFeatures(
            props.onBasicBookInfo.features,
            language.isoCode
        );
        // Now make the actual icons, one for each langFeature that occurs for
        // the current language.
        for (const feature of langFeatures) {
            languageElements.push(
                feature.icon({
                    fill: "rgb(86,166,177)",
                    style: {
                        height: featureBarHeight - 4 + "px",
                        width: featureBarHeight - 4 + "px",
                        marginLeft: "2px"
                    }
                })
            );
        }
        languageElements.push(", ");
    }
    languageElements.pop(); // remove last separator (if any)
    const card = (
        <CheapCard
            className={props.className}
            css={css`
                width: ${BookCardWidth}px;
            `}
            key={props.onBasicBookInfo.baseUrl}
            onClick={() => router!.pushBook(props.onBasicBookInfo.objectId)}
        >
            {/* For (39a) Lara the Yellow Ladybird I placed a file named "test-cover" in the bucket
        in order to play with how the cards can look once we have access to their actual cover images. */}
            <img
                className={"swiper-lazy"}
                css={css`
                    height: 100px;
                    object-fit: cover; //cover will crop, but fill up nicely
                `}
                alt={"book thumbnail"}
                // TODO: really this src shouldn't be needed because we are telling the swiper to be lazy,
                // so it should use the data-src attribute. But at the moment that leaves us with just broken images.
                src={harvestedThumbnailUrl}
                data-src={harvestedThumbnailUrl} // we would have to generate new thumbnails that just have the image shown on the cover
                onError={ev => {
                    if ((ev.target as any).src !== legacyStyleThumbnail) {
                        (ev.target as any).src = legacyStyleThumbnail;
                    } else {
                        console.log("ugh! no thumbnail in either place");
                    }
                }}
            />

            {/* I think it would look better to have a calm, light grey Bloom logo, or a book outline, or something, instead of this animated
            LOOK AT ME! spinner. */}
            {/* <div
            className={
                "swiper-lazy-preloader " +
                css`
                    margin-top: -50px;
                `
            }
        /> */}
            <div
                css={css`
                    background-color: ${featureBarColor};
                    height: ${featureBarHeight}px;
                    display: flex;
                `}
            >
                {featureElements}
                <div
                    css={css`
                        margin-left: auto;
                        margin-right: 2px;
                        margin-top: 2px;
                        font-size: 8pt;
                    `}
                >
                    {levelLabel}
                </div>
            </div>
            <div
                css={css`
                    font-weight: normal;
                    padding-left: 3px;
                    max-height: 40px;
                    overflow-y: hidden;
                    margin-top: 3px;
                    margin-bottom: 0;
                    font-size: 10pt;
                `}
            >
                {props.onBasicBookInfo.title}
            </div>
            <div
                css={css`
                    color: gray;
                    font-size: 9pt;
                    margin-top: auto;
                    padding: 3px;
                    overflow: hidden;
                    max-height: calc(2em + 4px);
                `}
            >
                {languageElements}
            </div>
        </CheapCard>
    );
    /* Note, LazyLoad currently breaks strict mode. See app.tsx */
    return props.lazy ? <LazyLoad>{card}</LazyLoad> : card;
};
