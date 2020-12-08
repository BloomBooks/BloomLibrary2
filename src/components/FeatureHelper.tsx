import React from "react";
import { ReactComponent as ActivityIcon } from "../assets/Activity.svg";
import { ReactComponent as ComicIcon } from "../assets/Comic.svg";
import { ReactComponent as MotionIcon } from "../assets/Motion.svg";
import { ReactComponent as SignLanguageIcon } from "../assets/Sign Language.svg";
import { ReactComponent as TalkingBookIcon } from "../assets/Talking Book.svg";
import { ReactComponent as VisuallyImpairedIcon } from "../assets/Visually Impaired.svg";
import { IFilter } from "../IFilter";
import { getTranslation } from "../localization/GetLocalizations";

// Information about features (like talking book, motion) that supports the display of
// features in the bar under the picture on book cards. Previously also supported Feature
// page cards, so there may be some obsolete fields still now these are just collections.

export interface IFeatureSpec {
    featureKey: string;
    //featureTitle: string; // For now, this is coming from Contentful
    filter: IFilter;
    //description: JSX.Element; // For now, this is coming from Contentful
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    languageDependent: boolean;
    // Is the feature present (in some collection of features...this is never set
    // in the mater list declared here, but only in results of
    // getAllFeaturesWithTheseMarkedPresent())
    isPresent?: boolean;
    // By default, a contentful collection of books with this feature may be obtained
    // with href "/" followed by featureKey. If that isn't right, collectionHref provides the
    // correct href (not including the leading slash).
    collectionHref?: string;
    englishLabel: string;
}

export const featureIconHeight = 12;

// For each possible feature, this gives its name and whether it is language dependent
// (appears next to the language in the languages list) or not (appears on the left of the
// feature bar). In addition, the icon is given as a function that takes some props and
// returns a react component.
// It would be simpler to, e.g., import comicIcon from "../assets/Comic.svg"
// (which yields a url), then let the icon: simply be that string, and let the code
// that wants the icon make an <img> with src={feature.icon}. But then we can't use
// fill: to control the color.
// To control the color, I had to remove the fill:"black" properties on the individual
// paths in the SVGs...nothing I found could override that. Then import them
// as react components, as above. Then we need to be able to style them, differently
// in different places. So icon can't just be a fixed react component.
// Thus, I ended up making icon a function that takes the props and builds the
// appropriate react component containing the right icon and using the supplied props.
export const featureSpecs: IFeatureSpec[] = [
    {
        featureKey: "talkingBook",
        // featureTitle: "Talking Books",
        filter: { feature: "talkingBook" },
        // description: (
        //     <div>
        //         <div>
        //             We all love to hear a story, and listening while reading
        //             along may help learners to improve their own reading skills.
        //         </div>
        //         <br />
        //         <div>
        //             Bloom's unique approach makes it easy to make Talking Books
        //             for the web &amp; phones. You can record by sentence, by
        //             text box, or by importing existing audio.&nbsp;
        //             <a href="https://vimeo.com/channels/bloomlibrary/181840473">
        //                 Learn More
        //             </a>
        //             .
        //         </div>
        //     </div>
        // ),
        icon(props) {
            return (
                <TalkingBookIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></TalkingBookIcon>
            );
        },
        languageDependent: true,
        collectionHref: "talking-books",
        englishLabel: "Talking Book",
    },
    {
        featureKey: "blind",
        // featureTitle: "Books for the Visually Impaired",
        filter: { feature: "blind" },
        // description: (
        //     <div>
        //         These books include narrated image descriptions to help the
        //         visually impaired.
        //     </div>
        // ),
        icon(props) {
            return (
                <VisuallyImpairedIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></VisuallyImpairedIcon>
            );
        },
        languageDependent: true,
        englishLabel: "Features for the Visually Impaired",
    },
    {
        featureKey: "comic",
        //featureTitle: "Comic Books",
        filter: { feature: "comic" },
        // description: (
        //     <div>
        //         Comic Books contain comic speech bubbles, captions, and/or other
        //         text which appears over images.
        //     </div>
        // ),
        icon(props) {
            return (
                <ComicIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></ComicIcon>
            );
        },
        languageDependent: false,
        collectionHref: "comics",
        englishLabel: "Comic Book",
    },
    {
        featureKey: "motion",
        //featureTitle: "Motion Books",
        filter: { feature: "motion" },
        // description: (
        //     <div>
        //         Motion Books are books in which otherwise still pictures appear
        //         to have motion. Normally, they are Talking Books to which you
        //         add motion.
        //         <br />
        //         <br />
        //         Motion books have two modes:
        //         <ul
        //             css={css`
        //                 list-style: unset;
        //                 padding-inline-start: 20px;
        //             `}
        //         >
        //             <li>
        //                 Portrait - When you look at your book in a portrait
        //                 view, you do not see motion, but you do see the text
        //                 highlighted with the audio.
        //             </li>
        //             <li>
        //                 Landscape - When you turn the device sideways for a
        //                 landscape view, pictures fill the screen and you see the
        //                 motion.
        //             </li>
        //         </ul>
        //     </div>
        //),
        icon(props) {
            return (
                <MotionIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></MotionIcon>
            );
        },
        languageDependent: false,
        englishLabel: "Motion Book",
    },
    {
        featureKey: "signLanguage",
        //featureTitle: "Sign Language Books",
        filter: { feature: "signLanguage" },
        // description: (
        //     <div>
        //         Sign Language Books contains videos of signed languages. They
        //         are often multilingual, including the text in another, written
        //         language.
        //     </div>
        // ),
        icon(props) {
            return (
                <SignLanguageIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></SignLanguageIcon>
            );
        },
        languageDependent: true,
        collectionHref: "sign-language",
        englishLabel: "Sign Language",
    },
    {
        featureKey: "activity",
        //featureTitle: "Books with Interactive Activities",
        filter: { feature: "activity OR quiz" },
        // description: (
        //     <div>
        //         These books contain one or more activities, such as
        //         multiple-choice quizzes, usually designed to assess
        //         comprehension.
        //     </div>
        // ),
        icon(props) {
            return (
                <ActivityIcon
                    title={getLocalizedLabel(this)}
                    {...props}
                ></ActivityIcon>
            );
        },
        languageDependent: false,
        collectionHref: "activities",
        englishLabel: "Interactive Activity",
    },
];

export function getLocalizedLabel(feature: IFeatureSpec): string {
    return getTranslation(
        `feature.${feature.featureKey}`,
        feature.englishLabel
    );
}

export function featureIsLanguageDependent(featureKey: string): boolean {
    for (const f of featureSpecs) {
        if (f.featureKey === featureKey) {
            return f.languageDependent;
        }
    }
    return false; // rather arbitrary default; shouldn't happen
}

// Gets a list of all the features. Those in the list passed will have isPresent true.
export function getAllFeaturesWithTheseMarkedPresent(
    features: string[] | undefined
): IFeatureSpec[] {
    return featureSpecs.map((f) => {
        const result = { ...f };
        if (!features) {
            return result;
        }
        for (const featureName of features) {
            if (f.featureKey === featureName) {
                result.isPresent = true;
            }
        }
        return result;
    });
}

export function getNonLanguageFeatures(
    features: string[] | undefined
): IFeatureSpec[] {
    if (!features) return [];
    return features
        .map(
            (f) =>
                featureSpecs.filter(
                    (x) => x.featureKey === f && !x.languageDependent
                )[0]
        )
        .filter((f) => !!f);
}

export function bookHasFeatureInLanguage(
    featureInfoOfBook: string[] | undefined,
    feature: string,
    lang: string
): boolean {
    if (!featureInfoOfBook) return false;

    return featureInfoOfBook.indexOf(feature + ":" + lang) >= 0;
}

// Get a FeatureOption (and thus icon-creating function) for each
// language-dependent feature in the list that has the specified
// language.
export function getFeaturesAvailableForOneLanguageOfBook(
    featureInfoOfBook: string[] | undefined,
    lang: string
): IFeatureSpec[] {
    if (!featureInfoOfBook) return [];
    return featureInfoOfBook
        .map(
            // for each feature in the book, look for a feature option
            // such that the book feature starts with the feature option
            // followed by a colon followed by the code for
            // the language of the current iteration.
            // For example, if we've just inserted 'English',
            // we will find a matching feature icon for
            // things like talkingBook:en and blind:en.
            (f) =>
                featureSpecs.filter(
                    (x) =>
                        f.startsWith(x.featureKey + ":") &&
                        f.split(":")[1] === lang
                )[0]
        )
        .filter((f) => !!f); // drop the features where there was no match
}
