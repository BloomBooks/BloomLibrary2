import React from "react";
import { ReactComponent as ActivityIcon } from "../assets/Activity.svg";
import { ReactComponent as ComicIcon } from "../assets/Comic.svg";
import { ReactComponent as MotionIcon } from "../assets/Motion.svg";
import { ReactComponent as SignLanguageIcon } from "../assets/Sign Language.svg";
import { ReactComponent as TalkingBookIcon } from "../assets/Talking Book.svg";
import { ReactComponent as VisuallyImpairedIcon } from "../assets/Visually Impaired.svg";

export interface IFeatureOption {
    featureKey: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    languageDependent: boolean;
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
export const featureOptions: IFeatureOption[] = [
    {
        featureKey: "talkingBook",
        icon: props => (
            <TalkingBookIcon title={"Taking Book"} {...props}></TalkingBookIcon>
        ),
        languageDependent: true
    },
    {
        featureKey: "blind",
        icon: props => (
            <VisuallyImpairedIcon
                title={"Features for the Visually Impaired"}
                {...props}
            ></VisuallyImpairedIcon>
        ),
        languageDependent: true
    },
    {
        featureKey: "comic",
        icon: props => <ComicIcon title={"Comic Book"} {...props}></ComicIcon>,
        languageDependent: false
    }, // todo: can't find this feature, is there another name?
    {
        featureKey: "motion",
        icon: props => (
            <MotionIcon title={"Motion Book"} {...props}></MotionIcon>
        ),
        languageDependent: false
    },
    {
        featureKey: "signLanguage",
        icon: props => (
            <SignLanguageIcon
                title={"Sign Language"}
                {...props}
            ></SignLanguageIcon>
        ),
        languageDependent: true
    },
    {
        featureKey: "activity",
        icon: props => (
            <ActivityIcon
                title={"Interactive Activity"}
                {...props}
            ></ActivityIcon>
        ),
        languageDependent: false
    } // todo: can't find this feature, is there another name?
];

export const getNonLanguageFeatures = (
    features: string[] | undefined
): IFeatureOption[] => {
    if (!features) return [];
    return features
        .map(
            f =>
                featureOptions.filter(
                    x => x.featureKey === f && !x.languageDependent
                )[0]
        )
        .filter(f => !!f);
};

// Get a FeatureOption (and thus icon-creating function) for each
// language-dependent feature in the list that has the specified
// language.
export const getLanguageFeatures = (
    features: string[] | undefined,
    lang: string
): IFeatureOption[] => {
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
                        f.startsWith(x.featureKey + ":") &&
                        f.split(":")[1] === lang
                )[0]
        )
        .filter(f => !!f); // drop the features where there was no match
};
