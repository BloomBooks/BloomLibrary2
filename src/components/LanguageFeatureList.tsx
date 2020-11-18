// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState } from "react";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import {
    getFeaturesAvailableForOneLanguageOfBook,
    featureIconHeight,
} from "./FeatureHelper";
import { getUniqueLanguages } from "./LanguageLink";
import { useTheme } from "@material-ui/core";
import TruncateMarkup from "react-truncate-markup";
import { getDisplayNamesForLanguage } from "../model/Language";
import { commonUI } from "../theme";

interface IProps {
    basicBookInfo: IBasicBookInfo;
}
// Displays a list of the languages of the book. For each language it shows its autonym,
// and if that is different from its English name it shows the English name, too.
// Then, if any of the language-dependent features occur in the book for that language, it shows
// the appropriate icon.
// Currently the list is truncated at about two lines high. We may want to make that configurable.
// Enhance: consider truncating more cleanly after the last language name that fits,
// and showing some indication that there are more (ideally, a count of how many more).
export const LanguageFeatureList: React.FunctionComponent<IProps> = (props) => {
    const theme = useTheme();

    // Figure out what to show in the language list area.
    // It's a mix of simple text nodes and possibly feature icons.
    const uniqueLanguages = getUniqueLanguages(props.basicBookInfo.languages);
    function getLanguageElements(showOneNamePerLanguage: boolean) {
        const languageElements: any[] = [];
        for (const language of uniqueLanguages) {
            const languageDisplayNames = getDisplayNamesForLanguage(language);
            languageElements.push(
                showOneNamePerLanguage
                    ? languageDisplayNames.primary
                    : languageDisplayNames.combined
            );

            // Looking for features that the book has with this language code attached,
            // such as talkingBook:en
            const langFeatures = getFeaturesAvailableForOneLanguageOfBook(
                props.basicBookInfo.features,
                language.isoCode
            );
            // Now make the actual icons, one for each langFeature that occurs for
            // the current language.
            for (const feature of langFeatures) {
                languageElements.push(
                    feature.icon({
                        key: language.isoCode + feature.featureKey,
                        fill: theme.palette.secondary.main,
                        style: {
                            height: featureIconHeight + "px",
                            width: featureIconHeight + "px",
                            marginLeft: "2px",
                        },
                    })
                );
            }
            languageElements.push(", ");
        }
        languageElements.pop(); // remove last separator (if any)
        return languageElements;
    }
    const [languageElementsDisplay, setLanguageElementsDisplay] = useState<
        Array<string | JSX.Element>
    >(getLanguageElements(false));

    return (
        <div
            css={css`
                color: ${commonUI.colors.minContrastGray};
                font-size: 9pt;
                margin-top: auto;
                padding: 3px;
                overflow: hidden;
                max-height: calc(2em + 4px);
            `}
        >
            <TruncateMarkup
                lines={2}
                // Per the docs:
                // To prevent infinite loops, onTruncate callback gets called only after the
                // initial run (on mount), any subsequent props/children updates will trigger a recomputation,
                // but onTruncate won't get called for these updates.
                onTruncate={(wasTruncated: boolean) => {
                    if (wasTruncated) {
                        // If the normal list which includes autonyms gets truncated,
                        // replace it with a list which has one name per language.
                        setLanguageElementsDisplay(getLanguageElements(true));
                    }
                }}
            >
                <span>{languageElementsDisplay}</span>
            </TruncateMarkup>
        </div>
    );
};
