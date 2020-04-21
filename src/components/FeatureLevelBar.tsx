// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import {
    IBasicBookInfo,
    getBestLevelStringOrEmpty,
} from "../connection/LibraryQueryHooks";
import { getNonLanguageFeatures, featureIconHeight } from "./FeatureHelper";

// The color of the feature bar is determined by the level, if it's a known one
// (except if there's no level it will be grey or white depending on
// whether any features or level are shown.)
const getFeatureBarColor = (level: string, featureCount: number): string => {
    switch (level) {
        case "1":
            return "rgb(246,188,46)";
        case "2":
            return "rgb(145,103,142)";
        case "3":
            return "rgb(65,149,163)";
        case "4":
            return " #439C77";
        default:
            if (featureCount > 0 || level) return "rgb(212,212,212)";
            else return "white";
    }
};

interface IProps {
    basicBookInfo: IBasicBookInfo;
}

// This bar (which appears under the picture in a BookCard) shows any reading level
// we know for the book, and any features that are language-independent.
export const FeatureLevelBar: React.FunctionComponent<IProps> = (props) => {
    // Figure out what level, if any, to show in the feature bar.
    const level = getBestLevelStringOrEmpty(props.basicBookInfo);
    const levelLabel = level ? `Level: ${level}` : "";

    // Now figure out what features will show in the feature bar.
    // They have to occur in the book and not be language-dependent.
    const featureBarFeatures = getNonLanguageFeatures(
        props.basicBookInfo.features
    );
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

    let featureBarColor = getFeatureBarColor(level, featureBarFeatures.length);

    return (
        <div
            css={css`
                background-color: ${featureBarColor};
                height: ${featureIconHeight + 4}px;
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
    );
};
