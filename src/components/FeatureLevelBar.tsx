import { css } from "@emotion/react";
import React, { useMemo } from "react";
import {
    IBasicBookInfo,
    getTagStringOrEmpty,
} from "../connection/LibraryQueryHooks";
import { getNonLanguageFeatures, featureIconHeight } from "./FeatureHelper";
import { useIntl } from "react-intl";

interface IProps {
    basicBookInfo: IBasicBookInfo;
}

const englishTooltipByLevel = [
    "", // <-- no level
    "First words & phrases",
    "First sentences",
    "First paragraphs",
    "Longer paragraphs",
];

// This bar (which appears under the picture in a BookCard) shows any reading level
// we know for the book, and any features that are language-independent.
export const FeatureLevelBar: React.FunctionComponent<IProps> = (props) => {
    const featureBarFeatures = getNonLanguageFeatures(
        props.basicBookInfo.features
    );
    const humanLevelValue = getTagStringOrEmpty(props.basicBookInfo, "level");
    const levelToShow = Number.parseInt(
        humanLevelValue
            ? humanLevelValue
            : getTagStringOrEmpty(props.basicBookInfo, "computedLevel"),
        10
    );

    const barColor = useMemo(() => {
        // The color of the feature bar is determined by the level, if it's a known one
        // (except if there's no level it will be grey or white depending on
        // whether any features or level are shown.)

        const barColorByLevel = [
            featureBarFeatures.length > 0 ? "#d4d4d4" : "white", // <-- no level
            "#f6bc2e",
            "#91678e",
            "#4195a3",
            "#439C77",
        ];
        return barColorByLevel[levelToShow];
    }, [levelToShow, featureBarFeatures.length]);

    const l10n = useIntl();
    const levelTooltip = useMemo(() => {
        if (levelToShow === 0) return "";
        let tip = l10n.formatMessage({
            id: "level.prefix",
            defaultMessage: "Content level: ",
        });
        tip += levelToShow
            ? l10n.formatMessage({
                  id: "level." + levelToShow.toString(),
                  defaultMessage: englishTooltipByLevel[levelToShow],
              })
            : "";
        const guessNotice = l10n.formatMessage({
            id: "level.automated-measure-notice",
            defaultMessage: "(this is an automated measure)",
        });
        return humanLevelValue ? tip : `${tip}\n${guessNotice}`;
    }, [l10n, levelToShow, humanLevelValue]);

    const featureElements = featureBarFeatures.map((feature) =>
        feature.icon({
            key: feature.featureKey,
            fill: "black", // They must have a color specified or will be transparent
            // I can't figure out how to make emotion CSS work here.
            style: {
                // I'd prefer to just specify a height and let width be automatic.
                // But then the browser keeps the original width of the SVG and pads
                // with (too much) white space.
                // I was afraid specifying both would mess up aspect ratios but
                // it doesn't seem to.
                height: featureIconHeight + "px",
                width: featureIconHeight + "px",
                marginLeft: "2px",
                marginTop: "2px",
            },
        })
    );

    return (
        <div
            css={css`
                background-color: ${barColor};
                height: ${featureIconHeight + 4}px;
                display: flex;
            `}
        >
            {featureElements}
            <div
                title={levelTooltip}
                css={css`
                    margin-left: auto;
                    margin-right: 6px;
                    margin-top: -8px;
                    font-size: 20pt;
                    letter-spacing: -3px;
                    color: #00000096; // just a bit of transparency to take the edge off
                `}
            >
                {"••••".substr(0, levelToShow)}
            </div>
        </div>
    );
};
