// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { getLanguageFeatures, featureIconHeight } from "./FeatureHelper";
import { getUniqueLanguages, getNameDisplay } from "./LanguageLink";

interface IProps {
    onBasicBookInfo: IBasicBookInfo;
}
// Displays a list of the languages of the book. For each language it shows its autonym,
// and if that is different from its English name it shows the English name, too.
// Then, if any of the language-dependent features occur in the book for that language, it shows
// the appropriate icon.
// Currently the list is truncated at about two lines high. We may want to make that configurable.
// Enhance: consider truncating more cleanly after the last language name that fits,
// and showing some indication that there are more (ideally, a count of how many more).
export const LanguageFeatureList: React.FunctionComponent<IProps> = props => {
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
                        height: featureIconHeight + "px",
                        width: featureIconHeight + "px",
                        marginLeft: "2px"
                    }
                })
            );
        }
        languageElements.push(", ");
    }
    languageElements.pop(); // remove last separator (if any)
    return (
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
    );
};
